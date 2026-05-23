import { getPOIs, getMunicipios } from '@/lib/content';
import { MapEditorClient } from './client';

export default function MapEditorPage() {
  const gcPois = getPOIs('en', 'gran-canaria');
  const gcMunicipios = getMunicipios('gran-canaria');
  const tfPois = getPOIs('en', 'tenerife');
  const tfMunicipios = getMunicipios('tenerife');

  return (
    <MapEditorClient
      gcPois={gcPois}
      gcMunicipios={gcMunicipios}
      tfPois={tfPois}
      tfMunicipios={tfMunicipios}
    />
  );
}
