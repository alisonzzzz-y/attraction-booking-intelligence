/// <reference types="node" />
import { createHash } from 'node:crypto'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { describe, expect, it } from 'vitest'
import { localPhotosForAttraction } from '../features/attractions/romeLocalPhotos'
import { romeAttractionOverview } from '../features/attractions/romeAttractionOverviews'
import { mergeRomeMapPlaces } from '../features/attractions/romeMapReferences'

describe('Rome detail assets', () => {
  it('provides a sourced introduction and at least two distinct complete JPEGs for every supported attraction', () => {
    const ids = new Set(
      mergeRomeMapPlaces([]).map((place) => place.attractionId),
    )
    expect(ids.size).toBe(10)
    for (const id of ids) {
      expect(romeAttractionOverview(id)?.text.length).toBeGreaterThan(0)
      expect(romeAttractionOverview(id)?.sourceUrl).toMatch(/^https:\/\//)
      const photos = localPhotosForAttraction(id)
      expect(photos.length, id).toBeGreaterThanOrEqual(2)
      const hashes = photos.map((photo) => {
        const bytes = readFileSync(resolve('public', photo.src.slice(1)))
        expect(bytes.subarray(0, 2).toString('hex'), photo.src).toBe('ffd8')
        expect(bytes.subarray(-2).toString('hex'), photo.src).toBe('ffd9')
        expect(photo.author.length).toBeGreaterThan(0)
        expect(photo.sourceUrl).toMatch(/^https:\/\//)
        expect(photo.licenseUrl).toMatch(/^https:\/\//)
        return createHash('sha256').update(bytes).digest('hex')
      })
      expect(new Set(hashes).size, id).toBe(photos.length)
    }
  })
})
