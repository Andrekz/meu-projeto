'use client';

import { useState, useCallback, useRef } from 'react';
import Map, { Marker, Popup, Source, Layer } from 'react-map-gl/maplibre';
import type { MapRef } from 'react-map-gl/maplibre';
import 'maplibre-gl/dist/maplibre-gl.css';

export interface OcorrenciaMapa {
  id: number;
  tipo: string;
  titulo: string;
  descricao: string;
  endereco: string;
  bairro: string;
  latitude: number;
  longitude: number;
}

export interface PostoMapaProps {
  id: number;
  nome: string;
  tipo: 'policial' | 'hospital';
  latitude: number;
  longitude: number;
  endereco: string | null;
}

export interface MapaRealProps {
  ocorrencias: OcorrenciaMapa[];
  posicaoUsuario: [number, number] | null;
  postos?: PostoMapaProps[];
}

function getSeveridade(tipo: string): 'Alta' | 'Media' {
  return tipo === 'Assalto' || tipo === 'Furto' ? 'Alta' : 'Media';
}

function getRaio(tipo: string): number {
  return getSeveridade(tipo) === 'Alta' ? 200 : 150;
}

// Gera polígono aproximado de círculo geográfico como GeoJSON
function criarCirculoGeoJSON(lat: number, lon: number, raioMetros: number, props: Record<string, unknown>): GeoJSON.Feature<GeoJSON.Polygon> {
  const lados = 48;
  const coords: [number, number][] = [];
  for (let i = 0; i <= lados; i++) {
    const angulo = (i / lados) * 2 * Math.PI;
    const dlat = (raioMetros / 111320) * Math.cos(angulo);
    const dlon = (raioMetros / (111320 * Math.cos((lat * Math.PI) / 180))) * Math.sin(angulo);
    coords.push([lon + dlon, lat + dlat]);
  }
  return {
    type: 'Feature',
    geometry: { type: 'Polygon', coordinates: [coords] },
    properties: props,
  };
}

const MAPA_ESTILO = 'https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json';

export default function ComponenteMapaReal({ ocorrencias, posicaoUsuario, postos = [] }: MapaRealProps) {
  const mapRef = useRef<MapRef>(null);
  const [popupInfo, setPopupInfo] = useState<OcorrenciaMapa | null>(null);
  const [popupPosto, setPopupPosto] = useState<PostoMapaProps | null>(null);

  const centroInicial = posicaoUsuario
    ? { longitude: posicaoUsuario[1], latitude: posicaoUsuario[0], zoom: 14 }
    : { longitude: -49.2675, latitude: -25.4296, zoom: 14 };

  const geojsonCirculos: GeoJSON.FeatureCollection<GeoJSON.Polygon> = {
    type: 'FeatureCollection',
    features: ocorrencias.map(o =>
      criarCirculoGeoJSON(o.latitude, o.longitude, getRaio(o.tipo), {
        id: o.id,
        severidade: getSeveridade(o.tipo),
      })
    ),
  };

  const onMapLoad = useCallback(() => {
    if (posicaoUsuario && mapRef.current) {
      mapRef.current.flyTo({
        center: [posicaoUsuario[1], posicaoUsuario[0]],
        zoom: 14,
        duration: 1200,
      });
    }
  }, [posicaoUsuario]);

  return (
    <div className="w-full h-full relative">
      <Map
        ref={mapRef}
        initialViewState={centroInicial}
        mapStyle={MAPA_ESTILO}
        style={{ width: '100%', height: '100%' }}
        onLoad={onMapLoad}
        attributionControl={false}
      >
        {/* Zonas de risco — círculos geográficos */}
        <Source id="riscos" type="geojson" data={geojsonCirculos}>
          <Layer
            id="riscos-fill"
            type="fill"
            paint={{
              'fill-color': [
                'case',
                ['==', ['get', 'severidade'], 'Alta'],
                '#ef4444',
                '#f59e0b',
              ],
              'fill-opacity': 0.18,
            }}
          />
          <Layer
            id="riscos-outline"
            type="line"
            paint={{
              'line-color': [
                'case',
                ['==', ['get', 'severidade'], 'Alta'],
                '#ef4444',
                '#f59e0b',
              ],
              'line-width': 1,
              'line-opacity': 0.6,
            }}
          />
        </Source>

        {/* Marcadores de ocorrência */}
        {ocorrencias.map(o => (
          <Marker
            key={`oc-${o.id}`}
            longitude={o.longitude}
            latitude={o.latitude}
            anchor="center"
            onClick={e => { e.originalEvent.stopPropagation(); setPopupInfo(o); setPopupPosto(null); }}
          >
            <div className="relative flex items-center justify-center w-5 h-5 cursor-pointer">
              <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-60 ${getSeveridade(o.tipo) === 'Alta' ? 'bg-red-400' : 'bg-amber-400'}`} />
              <span className={`relative inline-flex rounded-full h-3 w-3 ${getSeveridade(o.tipo) === 'Alta' ? 'bg-red-500 shadow-[0_0_8px_#ef4444]' : 'bg-amber-500 shadow-[0_0_8px_#f59e0b]'}`} />
            </div>
          </Marker>
        ))}

        {/* Popup de ocorrência */}
        {popupInfo && (
          <Popup
            longitude={popupInfo.longitude}
            latitude={popupInfo.latitude}
            anchor="bottom"
            onClose={() => setPopupInfo(null)}
            closeButton={true}
            className="font-sans"
          >
            <div className="p-1 max-w-[200px]">
              <span className={`text-[9px] font-bold uppercase px-1.5 py-0.5 rounded ${getSeveridade(popupInfo.tipo) === 'Alta' ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700'}`}>
                {popupInfo.tipo}
              </span>
              <p className="font-bold text-zinc-900 text-xs mt-1">{popupInfo.titulo}</p>
              <p className="text-[10px] text-zinc-600 mt-0.5 leading-relaxed">{popupInfo.descricao}</p>
              <p className="text-[9px] text-zinc-400 mt-1">{popupInfo.endereco} · {popupInfo.bairro}</p>
            </div>
          </Popup>
        )}

        {/* Marcadores de postos seguros */}
        {postos.map(p => (
          <Marker
            key={`ps-${p.id}`}
            longitude={p.longitude}
            latitude={p.latitude}
            anchor="center"
            onClick={e => { e.originalEvent.stopPropagation(); setPopupPosto(p); setPopupInfo(null); }}
          >
            <div className="relative flex items-center justify-center w-5 h-5 cursor-pointer">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-60" />
              <span className="relative inline-flex rounded-full h-3 w-3 bg-blue-500 shadow-[0_0_8px_#3b82f6]" />
            </div>
          </Marker>
        ))}

        {/* Popup de posto seguro */}
        {popupPosto && (
          <Popup
            longitude={popupPosto.longitude}
            latitude={popupPosto.latitude}
            anchor="bottom"
            onClose={() => setPopupPosto(null)}
            closeButton={true}
          >
            <div className="p-1 max-w-[180px]">
              <span className="text-[9px] font-bold uppercase px-1.5 py-0.5 rounded bg-blue-100 text-blue-700">
                {popupPosto.tipo === 'policial' ? 'Posto Policial' : 'Unidade de Saúde'}
              </span>
              <p className="font-bold text-zinc-900 text-xs mt-1">{popupPosto.nome}</p>
              {popupPosto.endereco && (
                <p className="text-[9px] text-zinc-400 mt-0.5">{popupPosto.endereco}</p>
              )}
            </div>
          </Popup>
        )}

        {/* Posição do usuário */}
        {posicaoUsuario && (
          <Marker
            longitude={posicaoUsuario[1]}
            latitude={posicaoUsuario[0]}
            anchor="center"
          >
            <div className="relative flex items-center justify-center w-6 h-6">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-300 opacity-75" />
              <span className="relative inline-flex rounded-full h-4 w-4 bg-emerald-400 shadow-[0_0_14px_#34d399] border-2 border-white" />
            </div>
          </Marker>
        )}
      </Map>
    </div>
  );
}
