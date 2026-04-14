export async function captureTelemetryData(): Promise<any> {
  return new Promise((resolve, reject) => {
    const telemetry: any = {
      location: {},
      browser: {},
      motion: [],
      timestamp: Date.now()
    };

    telemetry.browser.timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    telemetry.browser.webdriver = navigator.webdriver || false;
    telemetry.browser.userAgent = navigator.userAgent;

    const motionData: any[] = [];
    const motionHandler = (event: DeviceMotionEvent) => {
      // Capture the accelerometer readings
      motionData.push({
        x: event.acceleration?.x || 0,
        y: event.acceleration?.y || 0,
        z: event.acceleration?.z || 0,
        t: Date.now()
      });
    };
    
    // Start listening to the accelerometer
    window.addEventListener('devicemotion', motionHandler);

    // Stop listening after 3 seconds and then fetch geolocation
    setTimeout(() => {
      window.removeEventListener('devicemotion', motionHandler);
      telemetry.motion = motionData;

      if ("geolocation" in navigator) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            telemetry.location = {
              latitude: position.coords.latitude,
              longitude: position.coords.longitude,
              accuracy: position.coords.accuracy,
              timestamp: position.timestamp
            };
            resolve(telemetry);
          },
          (error) => {
            reject(new Error("Geolocation failed: " + error.message));
          },
          { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
        );
      } else {
        reject(new Error("Geolocation is not supported by this browser."));
      }
    }, 3000);
  });
}
