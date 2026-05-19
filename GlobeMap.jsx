import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Globe from "react-globe.gl";
import * as THREE from "three";

const BASE_URL = import.meta.env.BASE_URL;
const DEFAULT_GEOJSON_URL = `${BASE_URL}data/countries.geojson`;
const DEFAULT_TEXTURE_URL = `${BASE_URL}textures/earth-placeholder.svg`;

function getFeatureIso(feature) {
  return {
    isoA2: feature?.properties?.ISO_A2,
    isoA3: feature?.properties?.ISO_A3,
  };
}

function getCountryFromFeature(feature, countryByCode) {
  const { isoA2, isoA3 } = getFeatureIso(feature);
  return countryByCode.get(isoA3) ?? countryByCode.get(isoA2?.toLowerCase());
}

function getDistanceClass(distanceKm) {
  if (distanceKm === 0) return "exact";
  if (distanceKm < 1000) return "veryHot";
  if (distanceKm < 3000) return "hot";
  if (distanceKm < 6000) return "warm";
  return "cold";
}

function colorForGuess(guess) {
  if (guess.won) return "rgba(67, 217, 142, 0.92)";
  if (guess.adjacent) return "rgba(43, 179, 163, 0.88)";

  const colors = {
    veryHot: "rgba(239, 68, 68, 0.9)",
    hot: "rgba(249, 115, 22, 0.86)",
    warm: "rgba(255, 209, 102, 0.84)",
    cold: "rgba(96, 165, 250, 0.78)",
  };

  return colors[getDistanceClass(guess.distanceKm)] ?? colors.cold;
}

export default function GlobeMap({
  countries,
  guesses = [],
  selectedCountry,
  targetCountry,
  revealTarget = false,
  onCountryClick,
  geoJsonUrl = DEFAULT_GEOJSON_URL,
  globeImageUrl = DEFAULT_TEXTURE_URL,
}) {
  const globeRef = useRef();
  const wrapperRef = useRef();
  const sceneConfiguredRef = useRef(false);
  const [polygons, setPolygons] = useState([]);
  const [hoveredFeature, setHoveredFeature] = useState(null);
  const [size, setSize] = useState({ width: 720, height: 560 });

  const countryByCode = useMemo(() => {
    const map = new Map();
    countries.forEach(country => {
      map.set(country.code3, country);
      map.set(country.code2, country);
    });
    return map;
  }, [countries]);

  const guessByCode = useMemo(() => {
    const map = new Map();
    guesses.forEach(guess => {
      map.set(guess.country.code3, guess);
      map.set(guess.country.code2, guess);
    });
    return map;
  }, [guesses]);

  useEffect(() => {
    let cancelled = false;

    fetch(geoJsonUrl)
      .then(response => {
        if (!response.ok) throw new Error(`Could not load ${geoJsonUrl}`);
        return response.json();
      })
      .then(data => {
        if (!cancelled) setPolygons(data.features ?? []);
      })
      .catch(error => {
        console.error(error);
        if (!cancelled) setPolygons([]);
      });

    return () => {
      cancelled = true;
    };
  }, [geoJsonUrl]);

  useEffect(() => {
    if (!wrapperRef.current) return;

    const observer = new ResizeObserver(([entry]) => {
      const width = Math.max(320, Math.round(entry.contentRect.width));
      const height = Math.max(420, Math.min(680, Math.round(width * 0.72)));
      setSize({ width, height });
    });

    observer.observe(wrapperRef.current);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const globe = globeRef.current;
    if (!globe) return;

    const controls = globe.controls();
    controls.enableDamping = true;
    controls.dampingFactor = 0.08;
    controls.rotateSpeed = 0.65;
    controls.zoomSpeed = 0.8;
    controls.minDistance = 170;
    controls.maxDistance = 520;
    controls.autoRotateSpeed = 0.28;

    if (!sceneConfiguredRef.current) {
      globe.scene().add(new THREE.AmbientLight(0xffffff, 0.65));
      sceneConfiguredRef.current = true;
    }
  }, []);

  useEffect(() => {
    const controls = globeRef.current?.controls();
    if (!controls) return;
    controls.autoRotate = guesses.length === 0 && !selectedCountry;
  }, [guesses.length, selectedCountry]);

  useEffect(() => {
    const focusCountry = revealTarget ? targetCountry : selectedCountry;
    if (!globeRef.current || !focusCountry) return;

    globeRef.current.pointOfView(
      { lat: focusCountry.lat, lng: focusCountry.lng, altitude: 1.7 },
      900
    );
  }, [revealTarget, selectedCountry, targetCountry]);

  const getFeatureCountry = useCallback(
    feature => getCountryFromFeature(feature, countryByCode),
    [countryByCode]
  );

  const getPolygonColor = useCallback(
    feature => {
      const country = getFeatureCountry(feature);
      const isHovered = hoveredFeature === feature;

      if (!country) return "rgba(72, 80, 88, 0.22)";
      if (revealTarget && country.code3 === targetCountry?.code3) {
        return "rgba(67, 217, 142, 0.95)";
      }
      if (selectedCountry?.code3 === country.code3) {
        return "rgba(255, 209, 102, 0.95)";
      }

      const guess = guessByCode.get(country.code3);
      if (guess) return colorForGuess(guess);
      if (isHovered) return "rgba(255, 255, 255, 0.44)";

      return "rgba(205, 216, 217, 0.18)";
    },
    [getFeatureCountry, guessByCode, hoveredFeature, revealTarget, selectedCountry, targetCountry]
  );

  const handlePolygonClick = useCallback(
    feature => {
      const country = getFeatureCountry(feature);
      if (country) onCountryClick?.(country, feature);
    },
    [getFeatureCountry, onCountryClick]
  );

  return (
    <div ref={wrapperRef} className="globe-map">
      <Globe
        ref={globeRef}
        width={size.width}
        height={size.height}
        rendererConfig={{ antialias: true, alpha: true, preserveDrawingBuffer: true }}
        backgroundColor="rgba(0,0,0,0)"
        globeImageUrl={globeImageUrl}
        showAtmosphere
        atmosphereColor="#7edff2"
        atmosphereAltitude={0.18}
        polygonsData={polygons}
        polygonAltitude={feature => {
          const country = getFeatureCountry(feature);
          if (!country) return 0.004;
          if (selectedCountry?.code3 === country.code3) return 0.035;
          if (revealTarget && targetCountry?.code3 === country.code3) return 0.05;
          if (guessByCode.has(country.code3)) return 0.02;
          return hoveredFeature === feature ? 0.018 : 0.008;
        }}
        polygonCapColor={getPolygonColor}
        polygonSideColor={() => "rgba(24, 31, 35, 0.6)"}
        polygonStrokeColor={feature => {
          const country = getFeatureCountry(feature);
          return country ? "rgba(255,255,255,0.38)" : "rgba(255,255,255,0.14)";
        }}
        polygonLabel={feature => {
          const country = getFeatureCountry(feature);
          const name = country?.name ?? feature.properties?.NAME_ES ?? feature.properties?.name;
          return `<div class="globe-tooltip">${name}</div>`;
        }}
        onPolygonHover={setHoveredFeature}
        onPolygonClick={handlePolygonClick}
        enablePointerInteraction
      />
    </div>
  );
}
