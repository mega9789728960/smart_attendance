"use client";

import FaceCapture from "@/app/components/FaceCapture";

export default function TestFace() {
  return (
    <div className="p-6">
      <FaceCapture
        onCapture={(descriptor:number[]) => {
          console.log("Face Descriptor:", descriptor);
          console.log("Length:", descriptor.length);
        }}
      />
    </div>
  );
}
