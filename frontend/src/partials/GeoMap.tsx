import React, { useRef, useEffect, useState } from "react";
import { MapContainer, TileLayer, GeoJSON } from "react-leaflet";
import { PathOptions } from "leaflet";
import "leaflet/dist/leaflet.css";
import chroma from "chroma-js";

import { Country, GRID_INTENSITY } from "../assets/grid_intensities.ts";
//@ts-ignore
import { COUNTRY_GEOJSON } from "../assets/countries.js";
import { BLANK_SPACE } from "../utility/UtilityFunctions.ts";

export function getCountryColor(value :number | null) {
  const f = chroma.scale(['green', 'yellow', 'orange', 'brown', 'black']).domain([0, 125, 325, 600, 1000])
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
    <>
      <div className="w-full relative h-96 flex flex-col overflow-hidden rounded-lg border border-slate-500">
        <MapContainer
          center={[30, 0]}
          zoom={2}
          worldCopyJump={true}
          style={{ height: "100%", width: "100%", zIndex: 0 }}
          scrollWheelZoom={true}
          minZoom={2}
          ref={mapRef}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager_nolabels/{z}/{x}/{y}{r}.png"
          />
          {/* @tsignore */}
          <GeoJSON data={COUNTRY_GEOJSON.features} onEachFeature={onEachFeature} style={style} />
        </MapContainer>
        <div className="absolute z-10 top-4 right-4 bg-white p-2 rounded-md border-black border">
          <p className="text-sm">Grid Carbon Intensity (gCO₂/kWh)</p>
          <div className="flex h-3 rounded-2xl overflow-hidden w-full">
            {
              Array.from({ length: 100 }, (_, i) => (
                <div key={i}
                  className="w-[1%] h-full"
                  style={{ backgroundColor: getCountryColor(i * 10)}}
                ></div>
              ))
            }
          </div>
          <div className="relative w-full text-sm">
            <div className="w-full flex justify-between">
              {[0, 250, 500, 750, 1000].map((i) => (
                <p key={i} className="text-center" style={{ transform: '-translateX(-50%)' }}>
                  {i}
                </p>
              ))}
            </div>
          </div>
        </div>
      </div>
      <p className="text-base font-light text-right">
        Source:{BLANK_SPACE}
        <a
          className="text-cyan-700 hover:underline duration-300"
          href="https://www.electricitymaps.com/"
        >
          Electricity Maps - Yearly 2024
        </a>
      </p>
    </>
  );
};

export default GeoMap;
