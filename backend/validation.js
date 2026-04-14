function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 6371; // Earth's radius in km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLon/2) * Math.sin(dLon/2); 
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
  return R * c; 
}

async function getIPLocation(ip) {
  try {
    if (!ip || ip === '127.0.0.1' || ip === '::1' || ip.startsWith('192.168.')) {
      return { countryCode: null, city: null }; 
    }
    const res = await fetch(`https://ipapi.co/${ip}/json/`);
    const data = await res.json();
    return { countryCode: data.country_code, city: data.city };
  } catch (err) {
    console.error("IP Lookup Failed:", err.message);
    return { countryCode: null, city: null };
  }
}

async function getCountryFromCoords(lat, lon) {
  try {
    const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}`, {
      headers: { 'User-Agent': 'SmartAttendanceApp/1.0' }
    });
    const data = await res.json();
    return data.address?.country_code?.toUpperCase() || null;
  } catch (err) {
    console.error("Geocoding Failed:", err.message);
    return null;
  }
}

async function validateCheckIn(currentRequest, lastCheckIn) {
  let riskScore = 0;
  const flags = [];
  const RISK_THRESHOLD = 50;

  const { location, browser, motion } = currentRequest.telemetry;
  const clientIp = currentRequest.ip;
  
  // 1. Velocity Check (Impossible Travel detection)
  if (lastCheckIn && lastCheckIn.timestamp && location.timestamp) {
    const distanceKm = calculateDistance(
      lastCheckIn.latitude, lastCheckIn.longitude,
      location.latitude, location.longitude
    );
    
    const timeDiffHours = Math.abs(location.timestamp - Number(lastCheckIn.timestamp)) / (1000 * 60 * 60);
    
    if (timeDiffHours > 0) {
      const speedKmH = distanceKm / timeDiffHours;
      if (speedKmH > 150) {
        flags.push('Impossible Travel');
        riskScore += 100;
      }
    }
  }

  // 2. Accuracy Audit
  if (location.accuracy === 0 || Number.isInteger(location.accuracy)) {
     flags.push('Suspected Mock Location API');
     riskScore += 30; 
  }

  // 3. IP Cross-Reference
  const ipLocation = await getIPLocation(clientIp);
  const gpsCountryCode = await getCountryFromCoords(location.latitude, location.longitude);
  
  if (ipLocation.countryCode && gpsCountryCode) {
    if (ipLocation.countryCode.toUpperCase() !== gpsCountryCode.toUpperCase()) {
      flags.push(`Proxy/VPN detected (IP Country: ${ipLocation.countryCode}, GPS Country: ${gpsCountryCode})`);
      riskScore += 40;
    }
  }

  // 4. Integrity Check (Automation and Motion verification)
  if (browser.webdriver) {
    flags.push('Automated Browser Detected');
    riskScore += 100;
  }

  const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(browser.userAgent);
  
  if (isMobile) {
    const isMotionZero = motion.length === 0 || motion.every(m => m.x === 0 && m.y === 0 && m.z === 0);
    if (isMotionZero) {
      flags.push('Device statically placed or Mobile Mocking Framework used');
      riskScore += 30;
    }
  }

  return {
    success: riskScore < RISK_THRESHOLD,
    riskScore,
    flags,
    isFlagged: flags.length > 0
  };
}

module.exports = { validateCheckIn };
