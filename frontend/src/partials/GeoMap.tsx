import React, { useRef, useEffect, useState } from "react";
import { MapContainer, TileLayer, GeoJSON } from "react-leaflet";
import { PathOptions } from "leaflet";
import "leaflet/dist/leaflet.css";
import chroma from "chroma-js";

import { Country, GRID_INTENSITY } from "../assets/grid_intensities.ts";
//@ts-ignore
import { test } from "../assets/countries.js";

// current min max: 22, 814
// const arr = Object.values(GRID_INTENSITY).filter((x): x is number => x !== null)
// const MIN = Math.min(...arr); 
// const MAX = Math.max(...arr);

function getCountryColor(value :number | null) {
  const f = chroma.scale(['green', 'yellow', 'orange', 'brown']).domain([0, 200, 400, 1000])
  return f(value) as unknown as string;
}

interface GeomapProps {
  country: Country;
  setCountry: (value: Country) => void;
}

const GeoMap: React.FC<GeomapProps> = ({ country, setCountry }) => {

  const [hoveredCountry, setHoveredCountry] = useState<Country | null>(null);
  const prevClicked = useRef("");

  const mapRef = useRef<any>(null);

  useEffect(() => {
    if (mapRef.current) {
      mapRef.current.invalidateSize(); // Ensures map renders correctly
    }
  }, []);


  const getOpacity = (featureCountry: any) => {
    if (GRID_INTENSITY[featureCountry] === null) return 0;
    if (featureCountry === country) return 0.5;
    if (featureCountry === hoveredCountry) return 0.7;

    return 0.9;
  }

  const style = ((feature: any) :PathOptions => {
    // stroke?: boolean | undefined;
    // color?: string | undefined;
    // weight?: number | undefined;
    // opacity?: number | undefined;
    // lineCap?: LineCapShape | undefined;
    // lineJoin?: LineJoinShape | undefined;
    // dashArray?: string | number[] | undefined;
    // dashOffset?: string | undefined;
    // fill?: boolean | undefined;
    // fillColor?: string | undefined;
    // fillOpacity?: number | undefined;
    // fillRule?: FillRule | undefined;
    // renderer?: Renderer | undefined;
    // className?: string | undefined;
    const featureCountry = feature.properties.name;
    const intensity = GRID_INTENSITY[featureCountry];

    const isSelected = featureCountry === country;

    return ({
      // when province clicked, show the names and its corresponding number
      fillColor: getCountryColor(intensity),
      weight: isSelected ? 2 : 1,
      color: isSelected ? "white" : "black",
      opacity: isSelected ? 1 : 0.5,
      dashArray: isSelected ? '0' : '1',
      fillOpacity: getOpacity(featureCountry)
    });
  });

  const mouseoverEvent = (e: any) => {
    const layer = e.target;
    const properties = layer.feature.properties;

    setHoveredCountry(properties.name);

    layer.setStyle({
      fillOpacity: 1, // Increase opacity on hover
    });
  };

  const mouseoutEvent = (e: any) => {
    const layer = e.target;

    setHoveredCountry(null);

    layer.setStyle({
      fillOpacity: 0.7, // Reset opacity when not hovered
    });
  };

  const onclick = (e: any) => {
    const properties = e.target.feature.properties;
    const clicked = properties.name;
    const layer = e.target;

    const intensity = GRID_INTENSITY[clicked]
    if (intensity == null){
      return;
    }
    layer.closeTooltip();
    if (clicked === prevClicked.current){
      return;
    } else {
      prevClicked.current = clicked;
      setCountry(clicked);
    }
  };

  const onEachFeature = (feature:any, layer:any) => {
    const properties = feature.properties;
    const countryName = properties.name;

    const intensity = GRID_INTENSITY[countryName];
    const tooltipContent = (`
              <strong>${countryName}</strong>
              <br>
              <strong>${intensity ? `Carbon Intensity: ${intensity} gCO₂/kWh` : "No Data Available"}</strong>
            `);

    layer.bindTooltip(tooltipContent, {
      permanent: false,
      className: "province-label",
      style: { "font-size": "8px" },
      opacity: 0.9,
    });


    layer.on({
      add: (e: any) => {
        const layerElement = e.target.getElement();
        if (layerElement) {
            layerElement.setAttribute('aria-label', `Province: ${countryName}`);
            layerElement.setAttribute('aria-describedby', `details-${countryName}`);
        }
    },
      mouseover: mouseoverEvent, 
      mouseout: mouseoutEvent,
      mousedown: onclick,
    });
  }

  return (
    <div className="w-full h-96 flex flex-col overflow-hidden rounded-lg border border-slate-500 my-4">
      <MapContainer
        center={[30, 0]}
        zoom={2}
        worldCopyJump={true}
        style={{ height: "100%", width: "100%" }}
        scrollWheelZoom={true}
        minZoom={2}
        ref={mapRef}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.basemaps.cartocdn.com/light_nolabels/{z}/{x}/{y}{r}.png"
        />
        {/* @tsignore */}
        <GeoJSON data={test.features} onEachFeature={onEachFeature} style={style} />
      </MapContainer>
    </div>
  );
};

export default GeoMap;
