/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useRef, useState } from "react";

// Structure for 3D point
interface Point3D {
  x: number;
  y: number;
  z: number;
}

// Structure for a polygon face (for Painter's algorithm solid rendering)
interface Face {
  indices: number[];
  color: string;
  outlineColor: string;
  isLens?: boolean; // Lens gets special circular rendering or glass sheen
}

export default function Camera3D() {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Interaction angles
  const [angles, setAngles] = useState({ x: -0.2, y: 0.5 });
  const targetAngles = useRef({ x: -0.2, y: 0.5 });
  const currentAngles = useRef({ x: -0.2, y: 0.5 });
  const isDragging = useRef(false);
  const lastMousePos = useRef({ x: 0, y: 0 });

  // Handle user interaction
  useEffect(() => {
    const handleMouseMoveGlobal = (e: MouseEvent) => {
      if (isDragging.current) {
        const dx = e.clientX - lastMousePos.current.x;
        const dy = e.clientY - lastMousePos.current.y;
        targetAngles.current.y += dx * 0.007;
        targetAngles.current.x += dy * 0.007;

        // Constraint pitch rotation to prevent flipping upside down
        targetAngles.current.x = Math.max(-Math.PI / 3, Math.min(Math.PI / 3, targetAngles.current.x));

        lastMousePos.current = { x: e.clientX, y: e.clientY };
      }
    };

    const handleMouseUpGlobal = () => {
      isDragging.current = false;
      document.body.style.cursor = "default";
    };

    window.addEventListener("mousemove", handleMouseMoveGlobal);
    window.addEventListener("mouseup", handleMouseUpGlobal);

    return () => {
      window.removeEventListener("mousemove", handleMouseMoveGlobal);
      window.removeEventListener("mouseup", handleMouseUpGlobal);
    };
  }, []);

  // Set up modeling
  // We define vertices for a premium minimalist camera (Hasselblad/Leica style)
  const vertices: Point3D[] = [];
  const faces: Face[] = [];

  // 1. Camera Main Body Box (Width: 2.0, Height: 1.2, Depth: 0.7)
  // Indices 0 - 7
  // Front face (Z = +0.35)
  vertices.push({ x: -1.0, y: -0.6, z: 0.35 });  // 0: top-left-front
  vertices.push({ x: 1.0, y: -0.6, z: 0.35 });   // 1: top-right-front
  vertices.push({ x: 1.0, y: 0.6, z: 0.35 });    // 2: bottom-right-front
  vertices.push({ x: -1.0, y: 0.6, z: 0.35 });   // 3: bottom-left-front
  // Back face (Z = -0.35)
  vertices.push({ x: -1.0, y: -0.6, z: -0.35 }); // 4: top-left-back
  vertices.push({ x: 1.0, y: -0.6, z: -0.35 });  // 5: top-right-back
  vertices.push({ x: 1.0, y: 0.6, z: -0.35 });   // 6: bottom-right-back
  vertices.push({ x: -1.0, y: 0.6, z: -0.35 });  // 7: bottom-left-back

  // Body faces
  faces.push({ indices: [0, 1, 2, 3], color: "#1e1e24", outlineColor: "#2a2b36" }); // Front
  faces.push({ indices: [1, 5, 6, 2], color: "#141418", outlineColor: "#2a2b36" }); // Right
  faces.push({ indices: [4, 5, 1, 0], color: "#22222a", outlineColor: "#323442" }); // Top plate
  faces.push({ indices: [5, 4, 7, 6], color: "#0a0a0d", outlineColor: "#1a1a24" }); // Back
  faces.push({ indices: [4, 0, 3, 7], color: "#16161c", outlineColor: "#2a2b36" }); // Left
  faces.push({ indices: [3, 2, 6, 7], color: "#0f0f12", outlineColor: "#1c1c24" }); // Bottom

  // 2. Leather grip overlay (slightly raised front plates)
  // Indices 8 - 15
  vertices.push({ x: -0.92, y: -0.5, z: 0.37 }); // 8
  vertices.push({ x: -0.2, y: -0.5, z: 0.37 });  // 9
  vertices.push({ x: -0.2, y: 0.5, z: 0.37 });   // 10
  vertices.push({ x: -0.92, y: 0.5, z: 0.37 });  // 11
  
  vertices.push({ x: 0.2, y: -0.5, z: 0.37 });   // 12
  vertices.push({ x: 0.92, y: -0.5, z: 0.37 });  // 13
  vertices.push({ x: 0.92, y: 0.5, z: 0.37 });   // 14
  vertices.push({ x: 0.2, y: 0.5, z: 0.37 });    // 15

  faces.push({ indices: [8, 9, 10, 11], color: "#0c0c0e", outlineColor: "#181822" }); // Left leather
  faces.push({ indices: [12, 13, 14, 15], color: "#0c0c0e", outlineColor: "#181822" }); // Right leather

  // 3. Viewfinder / Flash mount on Top
  // Indices 16 - 23
  vertices.push({ x: -0.25, y: -0.8, z: 0.2 });  // 16
  vertices.push({ x: 0.25, y: -0.8, z: 0.2 });   // 17
  vertices.push({ x: 0.25, y: -0.6, z: 0.2 });   // 18
  vertices.push({ x: -0.25, y: -0.6, z: 0.2 });  // 19
  vertices.push({ x: -0.25, y: -0.8, z: -0.2 }); // 20
  vertices.push({ x: 0.25, y: -0.8, z: -0.2 });  // 21
  vertices.push({ x: 0.25, y: -0.6, z: -0.2 });  // 22
  vertices.push({ x: -0.25, y: -0.6, z: -0.2 }); // 23

  faces.push({ indices: [16, 17, 18, 19], color: "#181820", outlineColor: "#3a3b48" }); // Top-front mount
  faces.push({ indices: [20, 21, 17, 16], color: "#2d2d38", outlineColor: "#3f4254" }); // Top-top mount
  faces.push({ indices: [17, 21, 22, 18], color: "#1c1c24", outlineColor: "#3a3b48" });
  faces.push({ indices: [20, 16, 19, 23], color: "#16161e", outlineColor: "#3a3b48" });

  // 4. Little Shutter Button Cylinder & Dial
  // Indices 24 - 27 (Shutter)
  vertices.push({ x: -0.7, y: -0.7, z: 0.0 });   // 24
  vertices.push({ x: -0.55, y: -0.7, z: 0.0 });  // 25
  vertices.push({ x: -0.55, y: -0.6, z: 0.0 });  // 26
  vertices.push({ x: -0.7, y: -0.6, z: 0.0 });   // 27

  faces.push({ indices: [24, 25, 26, 27], color: "#b91c1c", outlineColor: "#e11d48" }); // Red shutter dial button!

  // Ring Dial on Right Top
  // Indices 28 - 31
  vertices.push({ x: 0.6, y: -0.68, z: 0.15 });  // 28
  vertices.push({ x: 0.78, y: -0.68, z: 0.15 }); // 29
  vertices.push({ x: 0.78, y: -0.68, z: -0.15 });// 30
  vertices.push({ x: 0.6, y: -0.68, z: -0.15 }); // 31
  faces.push({ indices: [28, 29, 30, 31], color: "#d1d5db", outlineColor: "#ffffff" }); // Metal knob

  // 5. Huge circular lens assembly protruding on the front!
  // To draw a sphere/cylinder, we can generate a series of ring vertices.
  // Let's create two ring layers.
  // Ring 1 (base): Z = 0.35, Radius = 0.52. High-vertex count (e.g. 12 steps).
  // Ring 2 (outer edge): Z = 0.8, Radius = 0.50.
  // Ring 3 (inner glass segment): Z = 0.82, Radius = 0.42.
  const ringCentX = 0;
  const ringCentY = 0;
  const segments = 16;
  
  const ring1StartIndex = vertices.length;
  for (let i = 0; i < segments; i++) {
    const angle = (i / segments) * Math.PI * 2;
    const rx = Math.cos(angle) * 0.54;
    const ry = Math.sin(angle) * 0.54;
    vertices.push({ x: ringCentX + rx, y: ringCentY + ry, z: 0.35 });
  }

  const ring2StartIndex = vertices.length;
  for (let i = 0; i < segments; i++) {
    const angle = (i / segments) * Math.PI * 2;
    const rx = Math.cos(angle) * 0.54;
    const ry = Math.sin(angle) * 0.54;
    vertices.push({ x: ringCentX + rx, y: ringCentY + ry, z: 0.75 });
  }

  const ring3StartIndex = vertices.length;
  for (let i = 0; i < segments; i++) {
    const angle = (i / segments) * Math.PI * 2;
    const rx = Math.cos(angle) * 0.42;
    const ry = Math.sin(angle) * 0.42;
    vertices.push({ x: ringCentX + rx, y: ringCentY + ry, z: 0.78 });
  }

  // Generate Cylinder walls
  for (let i = 0; i < segments; i++) {
    const nextIdx = (i + 1) % segments;
    
    // Outer lens barrel faces (connecting Ring 1 and Ring 2)
    faces.push({
      indices: [
        ring1StartIndex + i,
        ring1StartIndex + nextIdx,
        ring2StartIndex + nextIdx,
        ring2StartIndex + i
      ],
      color: "#181820",
      outlineColor: "#282936"
    });

    // Outer lens lip (connecting Ring 2 and Ring 3)
    faces.push({
      indices: [
        ring2StartIndex + i,
        ring2StartIndex + nextIdx,
        ring3StartIndex + nextIdx,
        ring3StartIndex + i
      ],
      color: "#111115",
      outlineColor: "#2d2d38"
    });
  }

  // Inner glass face (closing Ring 3)
  const lensFaceIndices: number[] = [];
  for (let i = segments - 1; i >= 0; i--) {
    lensFaceIndices.push(ring3StartIndex + i);
  }
  faces.push({
    indices: lensFaceIndices,
    color: "#0c2b4c", // Beautiful dark glass-blue sheen
    outlineColor: "#38bdf8", // Glowing cyan rim
    isLens: true
  });

  // Let's add a visual red dot on the lens chassis (Leica style!)
  const RED_DOT_VERT_INDEX = vertices.length;
  vertices.push({ x: 0.38, y: -0.38, z: 0.38 }); // red dot
  vertices.push({ x: 0.43, y: -0.38, z: 0.38 });
  vertices.push({ x: 0.43, y: -0.43, z: 0.38 });
  vertices.push({ x: 0.38, y: -0.43, z: 0.38 });
  faces.push({
    indices: [RED_DOT_VERT_INDEX, RED_DOT_VERT_INDEX + 1, RED_DOT_VERT_INDEX + 2, RED_DOT_VERT_INDEX + 3],
    color: "#dc2626",
    outlineColor: "#ef4444"
  });

  // Render loop
  useEffect(() => {
    let animationFrameId: number;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Handles resizing
    const handleResize = () => {
      const container = containerRef.current;
      if (!container || !canvas) return;
      const width = container.clientWidth;
      const height = container.clientHeight;
      canvas.width = width * window.devicePixelRatio;
      canvas.height = height * window.devicePixelRatio;
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
    };

    window.addEventListener("resize", handleResize);
    handleResize();

    // Mouse movement to tilt camera slightly even if not dragging
    let hoverOffsetX = 0;
    let hoverOffsetY = 0;

    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging.current && canvas) {
        const rect = canvas.getBoundingClientRect();
        // Normalize mouse pos from -0.5 to 0.5
        const mx = (e.clientX - rect.left) / rect.width - 0.5;
        const my = (e.clientY - rect.top) / rect.height - 0.5;
        
        hoverOffsetX = mx * 0.4;
        hoverOffsetY = my * 0.4;
      }
    };

    const handleMouseLeave = () => {
      hoverOffsetX = 0;
      hoverOffsetY = 0;
    };

    canvas.addEventListener("mousemove", handleMouseMove);
    canvas.addEventListener("mouseleave", handleMouseLeave);

    const render = () => {
      const width = canvas.width / window.devicePixelRatio;
      const height = canvas.height / window.devicePixelRatio;
      ctx.clearRect(0, 0, width, height);

      // Auto rotation when idle
      if (!isDragging.current) {
        targetAngles.current.y += 0.003; // Constant slow rotate
      }

      // Smooth interpolation (lerping)
      const targetY = targetAngles.current.y + hoverOffsetX;
      const targetX = targetAngles.current.x + hoverOffsetY;

      currentAngles.current.y += (targetY - currentAngles.current.y) * 0.08;
      currentAngles.current.x += (targetX - currentAngles.current.x) * 0.08;

      const cosY = Math.cos(currentAngles.current.y);
      const sinY = Math.sin(currentAngles.current.y);
      const cosX = Math.cos(currentAngles.current.x);
      const sinX = Math.sin(currentAngles.current.x);

      // Perspective scale factor
      const zoom = Math.min(width, height) * 0.40;

      // Project all vertices
      const transformedVertices = vertices.map((v) => {
        // Rotate around Y-axis (Yaw)
        let x1 = v.x * cosY - v.z * sinY;
        let z1 = v.x * sinY + v.z * cosY;

        // Rotate around X-axis (Pitch)
        let y2 = v.y * cosX - z1 * sinX;
        let z2 = v.y * sinX + z1 * cosX;

        // Perspective Projection
        const distance = 4.0; // Distance of camera from eye
        const perspective = 3.0 / (distance + z2);

        return {
          px: width / 2 + x1 * zoom * perspective,
          py: height / 2 + y2 * zoom * perspective * 1.05, // ratio adjustment
          depth: z2, // store Depth for Painter's sorting
        };
      });

      // Painter's algorithm
      // Sort faces based on the average depth of their translated vertices (highest depth rendered first)
      const faceDepths = faces.map((face, index) => {
        let sumDepth = 0;
        face.indices.forEach((idx) => {
          sumDepth += transformedVertices[idx].depth;
        });
        return {
          faceIndex: index,
          avgDepth: sumDepth / face.indices.length,
        };
      });

      // Sort descending (back-to-front depth)
      faceDepths.sort((a, b) => b.avgDepth - a.avgDepth);

      // Draw faces
      faceDepths.forEach(({ faceIndex }) => {
        const face = faces[faceIndex];
        ctx.beginPath();
        
        ctx.moveTo(transformedVertices[face.indices[0]].px, transformedVertices[face.indices[0]].py);
        for (let i = 1; i < face.indices.length; i++) {
          ctx.lineTo(transformedVertices[face.indices[i]].px, transformedVertices[face.indices[i]].py);
        }
        ctx.closePath();

        // Elegant gradient or flat colors depending on face types
        if (face.isLens) {
          // Special circular sheen effect
          const ctr = transformedVertices[ring3StartIndex];
          
          const glassGrad = ctx.createRadialGradient(
            transformedVertices[ring3StartIndex].px, 
            transformedVertices[ring3StartIndex].py, 
            0,
            transformedVertices[ring3StartIndex].px, 
            transformedVertices[ring3StartIndex].py, 
            zoom * 0.16
          );
          glassGrad.addColorStop(0, "#103E6C");
          glassGrad.addColorStop(0.5, "#061A30");
          glassGrad.addColorStop(1, "#03080F");

          ctx.fillStyle = glassGrad;
          ctx.fill();

          // Highlight flash
          ctx.beginPath();
          ctx.ellipse(
            transformedVertices[ring3StartIndex + 4].px,
            transformedVertices[ring3StartIndex + 4].py,
            zoom * 0.05,
            zoom * 0.012,
            Math.PI / 4,
            0,
            Math.PI * 2
          );
          ctx.fillStyle = "rgba(255, 255, 255, 0.15)";
          ctx.fill();
        } else {
          ctx.fillStyle = face.color;
          ctx.fill();
        }

        // Stroke line/wireframe
        ctx.lineWidth = face.isLens ? 2.5 : 1.2;
        ctx.strokeStyle = face.outlineColor;
        ctx.stroke();
      });

      // Overlay small decorative hud design tags for "premium luxury website"
      ctx.font = "10px JetBrains Mono, monospace";
      ctx.fillStyle = "rgba(15, 23, 42, 0.5)";
      ctx.fillText("CAM-SYS v1.0.8", 20, 30);
      ctx.fillText(`ROT-Y: ${currentAngles.current.y.toFixed(2)}rad`, 20, 45);
      
      // Focus indicator graphic
      ctx.strokeStyle = "rgba(15, 23, 42, 0.15)";
      ctx.lineWidth = 1;
      ctx.strokeRect(width / 2 - 40, height / 2 - 40, 80, 80);
      
      ctx.beginPath();
      ctx.arc(width / 2, height / 2, 6, 0, Math.PI * 2);
      ctx.fillStyle = "rgba(15, 23, 42, 0.3)";
      ctx.fill();

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener("resize", handleResize);
      if (canvas) {
        canvas.removeEventListener("mousemove", handleMouseMove);
        canvas.removeEventListener("mouseleave", handleMouseLeave);
      }
    };
  }, []);

  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    isDragging.current = true;
    lastMousePos.current = { x: e.clientX, y: e.clientY };
    document.body.style.cursor = "grabbing";
  };

  return (
    <div
      ref={containerRef}
      id="canvas-container"
      className="relative w-full h-[320px] md:h-[480px] bg-transparent cursor-grab active:cursor-grabbing outline-none"
    >
      <canvas
        ref={canvasRef}
        onMouseDown={handleMouseDown}
        className="block touch-none"
      />
      {/* 3D helper text */}
      <div className="absolute right-4 bottom-4 flex items-center gap-2 pointer-events-none select-none text-xs text-slate-400 font-mono">
        <span className="animate-pulse w-2 h-2 rounded-full bg-slate-500"></span>
        PUTAR DENGAN SENSOR MOUSE / DRAG
      </div>
    </div>
  );
}
