// Google Maps TypeScript definitions
declare global {
  interface Window {
    google: {
      maps: {
        Map: new (element: HTMLElement, options?: any) => any
        Marker: new (options?: any) => any
        Geocoder: new () => {
          geocode: (request: any, callback: (results: any[], status: string) => void) => void
        }
        LatLng: new (lat: number, lng: number) => any
        LatLngBounds: new () => {
          extend: (latLng: any) => void
        }
        InfoWindow: new (options?: any) => {
          setContent: (content: string) => void
          open: (map: any, marker: any) => void
        }
        Animation: {
          DROP: any
        }
        places: {
          PlacesService: new (element: HTMLElement) => any
        }
      }
    }
  }
}

export {}

