import { useState } from 'react'
import {
  localPhotosForAttraction,
  type LocalAttractionPhoto,
} from './romeLocalPhotos'

export function LocalPhotoAttribution({
  photo,
}: {
  photo: LocalAttractionPhoto
}) {
  return (
    <span className="place-photo-attribution">
      Photo credit:{' '}
      <a
        href={photo.sourceUrl}
        onClick={(event) => event.stopPropagation()}
        rel="noreferrer"
        target="_blank"
      >
        {photo.author}
      </a>
      {' · '}
      <a
        href={photo.licenseUrl}
        onClick={(event) => event.stopPropagation()}
        rel="noreferrer"
        target="_blank"
      >
        {photo.license}
      </a>
    </span>
  )
}

export function AttractionPhotoGallery({
  attractionId,
  name,
}: {
  attractionId?: string
  name: string
}) {
  const photos = localPhotosForAttraction(attractionId)
  const [selectedPhotoIndex, setSelectedPhotoIndex] = useState(0)

  if (photos.length === 0) {
    return (
      <section
        aria-label={`${name} photos`}
        className="result-photo-gallery result-photo-gallery-empty"
      >
        <p>Attraction imagery is not available yet.</p>
      </section>
    )
  }

  const selectedPhoto = photos[selectedPhotoIndex]
  const hasMultiplePhotos = photos.length > 1

  return (
    <section aria-label={`${name} photos`} className="result-photo-gallery">
      <div className="result-photo-main">
        <img alt={selectedPhoto.alt} decoding="async" src={selectedPhoto.src} />
        <div className="result-photo-credit">
          <LocalPhotoAttribution photo={selectedPhoto} />
        </div>
        {hasMultiplePhotos ? (
          <>
            <button
              aria-label="Show previous photo"
              className="result-photo-control result-photo-previous"
              onClick={() =>
                setSelectedPhotoIndex((current) =>
                  current === 0 ? photos.length - 1 : current - 1,
                )
              }
              type="button"
            >
              <span aria-hidden="true">←</span>
            </button>
            <button
              aria-label="Show next photo"
              className="result-photo-control result-photo-next"
              onClick={() =>
                setSelectedPhotoIndex(
                  (current) => (current + 1) % photos.length,
                )
              }
              type="button"
            >
              <span aria-hidden="true">→</span>
            </button>
            <span className="result-photo-count">
              {selectedPhotoIndex + 1} / {photos.length}
            </span>
          </>
        ) : null}
      </div>
      {hasMultiplePhotos ? (
        <div aria-label="Photo gallery" className="result-photo-thumbnails">
          {photos.map((photo, index) => (
            <button
              aria-label={`Show photo ${index + 1}`}
              aria-pressed={index === selectedPhotoIndex}
              className={
                index === selectedPhotoIndex
                  ? 'result-photo-thumbnail selected'
                  : 'result-photo-thumbnail'
              }
              key={photo.src}
              onClick={() => setSelectedPhotoIndex(index)}
              type="button"
            >
              <img alt="" loading="lazy" src={photo.src} />
            </button>
          ))}
        </div>
      ) : null}
    </section>
  )
}
