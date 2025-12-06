
import React, { useEffect, useRef, useState } from 'react';
import { select, scaleLinear, range, easeCubicOut } from 'd3';
import { IncidentReport, SeverityLevel } from '../types';

interface IncidentMapProps {
  incidents: IncidentReport[];
}

export const IncidentMap: React.FC<IncidentMapProps> = ({ incidents }) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState({ width: 0, height: 400 });

  // Handle Resize
  useEffect(() => {
    if (!wrapperRef.current) return;

    const observer = new ResizeObserver((entries) => {
      if (entries[0]) {
        const { width, height } = entries[0].contentRect;
        setDimensions({ width, height: height || 400 }); // Default height fallback
      }
    });

    observer.observe(wrapperRef.current);

    return () => observer.disconnect();
  }, []);

  // Setup Map Base (Run when dimensions change or mount)
  useEffect(() => {
    if (!svgRef.current || dimensions.width === 0) return;

    const svg = select(svgRef.current);
    const { width, height } = dimensions;

    // Clear previous renders
    svg.selectAll("*").remove();

    // Background Map Placeholder (Subtle Grid)
    svg.append("rect")
       .attr("width", "100%")
       .attr("height", "100%")
       .attr("fill", "#f8fafc");

    // Grid Lines for "Technical/Live" feel
    const gridGroup = svg.append("g").attr("class", "grid-lines").attr("opacity", 0.3);
    
    // Vertical lines
    gridGroup.selectAll("line.v")
       .data(range(0, width, 50))
       .enter().append("line")
       .attr("x1", d => d).attr("x2", d => d)
       .attr("y1", 0).attr("y2", height)
       .attr("stroke", "#cbd5e1").attr("stroke-dasharray", "4 4");

    // Horizontal lines
    gridGroup.selectAll("line.h")
       .data(range(0, height, 50))
       .enter().append("line")
       .attr("x1", 0).attr("x2", width)
       .attr("y1", d => d).attr("y2", d => d)
       .attr("stroke", "#cbd5e1").attr("stroke-dasharray", "4 4");
    
    // Layers
    svg.append("g").attr("class", "pulse-layer");
    svg.append("g").attr("class", "dot-layer");

    // Legend (responsive positioning)
    const legendY = Math.max(height - 40, 10);
    const legend = svg.append("g").attr("transform", `translate(20, ${legendY})`);
    legend.append("rect").attr("width", 140).attr("height", 30).attr("fill", "white").attr("rx", 6).attr("opacity", 0.9).attr("filter", "drop-shadow(0 1px 2px rgb(0 0 0 / 0.1))");
    legend.append("circle").attr("cx", 15).attr("cy", 15).attr("r", 4).attr("fill", "#DC2626");
    legend.append("text").attr("x", 28).attr("y", 19).text("Critical Incident").attr("font-size", "10px").attr("fill", "#334155").attr("font-weight", "600");

    // Tooltip Container (Invisible initially) - Remove old one first if exists
    select("body").selectAll(".incident-tooltip").remove();
    
    const tooltip = select("body").append("div")
      .attr("class", "incident-tooltip absolute z-[60] bg-gray-900 text-white p-3 rounded-lg text-xs shadow-xl pointer-events-none transition-opacity opacity-0 transform -translate-x-1/2 -translate-y-full")
      .style("margin-top", "-10px");

  }, [dimensions.width, dimensions.height]); // Re-run setup only when size changes

  // Update Data (Real-time)
  useEffect(() => {
    if (!svgRef.current || dimensions.width === 0) return;
    
    const validIncidents = incidents.filter(i => 
      i.location && 
      typeof i.location.lat === 'number' && 
      typeof i.location.lng === 'number'
    );

    const svg = select(svgRef.current);
    const { width, height } = dimensions;

    // Fixed Bounds for Nigeria
    const latMin = 4;
    const latMax = 14;
    const lngMin = 2;
    const lngMax = 15;

    const xScale = scaleLinear()
      .domain([lngMin, lngMax])
      .range([40, width - 40]);
      
    const yScale = scaleLinear()
      .domain([latMin, latMax])
      .range([height - 40, 40]); // Flip Y

    const pulseLayer = svg.select(".pulse-layer");
    const dotLayer = svg.select(".dot-layer");
    const tooltip = select(".incident-tooltip");

    // 1. UPDATE PULSES (Critical/High)
    const criticalIncidents = validIncidents.filter(d => 
        d.severity === SeverityLevel.Critical || d.severity === SeverityLevel.High
    );

    pulseLayer.selectAll("circle.pulse")
      .data(criticalIncidents, (d: any) => d.id)
      .join(
        enter => enter.append("circle")
          .attr("class", "pulse")
          .attr("cx", d => xScale(d.location.lng))
          .attr("cy", d => yScale(d.location.lat))
          .attr("r", 0) // Animate from 0
          .attr("fill", d => d.severity === SeverityLevel.Critical ? "#ef4444" : "#f97316")
          .attr("opacity", 0.4)
          .call(enter => enter.transition().duration(500).attr("r", 10))
          .call(enter => {
             // Add continuous pulse animation
             enter.append("animate")
              .attr("attributeName", "r")
              .attr("from", "8")
              .attr("to", "25")
              .attr("dur", "1.5s")
              .attr("repeatCount", "indefinite");
             enter.append("animate")
              .attr("attributeName", "opacity")
              .attr("values", "0.4; 0; 0.4")
              .attr("dur", "1.5s")
              .attr("repeatCount", "indefinite");
          }),
        update => update
          .transition().duration(500)
          .attr("cx", d => xScale(d.location.lng))
          .attr("cy", d => yScale(d.location.lat)),
        exit => exit.transition().duration(300).attr("r", 0).remove()
      );


    // 2. UPDATE DOTS (All incidents)
    dotLayer.selectAll("circle.dot")
      .data(validIncidents, (d: any) => d.id)
      .join(
        enter => enter.append("circle")
          .attr("class", "dot")
          .attr("cx", d => xScale(d.location.lng))
          .attr("cy", d => yScale(d.location.lat))
          .attr("r", 0)
          .attr("fill", d => {
            if (d.severity === SeverityLevel.Critical) return "#DC2626";
            if (d.severity === SeverityLevel.High) return "#EA580C";
            if (d.severity === SeverityLevel.Medium) return "#CA8A04";
            return "#16A34A";
          })
          .attr("stroke", "#ffffff")
          .attr("stroke-width", 2)
          .style("cursor", "pointer")
          .on("mouseover", function(event, d) {
            select(this).transition().duration(200).attr("r", 12);
            tooltip.style("opacity", 1).html(`
              <div class="font-bold text-sm mb-1">${d.type}</div>
              <div class="text-gray-300 mb-1">${d.location?.address}</div>
              <div class="flex items-center gap-2 mt-2">
                 <span class="px-2 py-0.5 rounded-full text-[10px] bg-white/20 uppercase tracking-wider">${d.severity}</span>
                 <span class="text-[10px] opacity-70">${new Date(d.timestamp).toLocaleTimeString()}</span>
              </div>
            `);
          })
          .on("mousemove", function(event) {
            tooltip
              .style("left", (event.pageX) + "px")
              .style("top", (event.pageY) + "px");
          })
          .on("mouseout", function(event, d) {
             select(this).transition().duration(200).attr("r", d.severity === SeverityLevel.Critical ? 8 : 6);
             tooltip.style("opacity", 0);
          })
          .call(enter => enter.transition().duration(600).ease(easeCubicOut).attr("r", d => d.severity === SeverityLevel.Critical ? 8 : 6)),
        
        update => update
          .transition().duration(500)
          .attr("cx", d => xScale(d.location.lng))
          .attr("cy", d => yScale(d.location.lat))
          .attr("fill", d => {
            if (d.severity === SeverityLevel.Critical) return "#DC2626";
            if (d.severity === SeverityLevel.High) return "#EA580C";
            if (d.severity === SeverityLevel.Medium) return "#CA8A04";
            return "#16A34A";
          }),
        
        exit => exit
          .transition().duration(300)
          .attr("r", 0)
          .remove()
      );

  }, [incidents, dimensions]);

  return (
    <div ref={wrapperRef} className="relative w-full h-full min-h-[400px] rounded-xl overflow-hidden border border-gray-200 shadow-sm bg-slate-50">
        <svg ref={svgRef} className="w-full h-full" />
        <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm px-3 py-1.5 rounded-full text-xs font-semibold text-gray-600 border border-gray-200 shadow-sm flex items-center gap-2 z-10">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-green-500"></span>
            </span>
            <span className="hidden sm:inline">Live Updates</span>
            <span className="sm:hidden">Live</span>
        </div>
    </div>
  );
};
