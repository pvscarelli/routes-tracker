'use client'

import { useEffect, useRef } from 'react'
import { useMap } from '../../hooks/useMap'
import { socket } from '@/src/utils/socket-io'

export type MapDriverProps = {
  route_id: string | null
  start_location: {
    lat: number
    lng: number
  } | null
  end_location: {
    lat: number
    lng: number
  } | null
}

export function MapDriver(props: MapDriverProps) {
  const { route_id, start_location, end_location } = props
  const mapContainerRef = useRef<HTMLDivElement>(null)
  const map = useMap(mapContainerRef)

  useEffect(() => {
    if (!map || !route_id || !start_location || !end_location) return

    // eslint-disable-next-line @typescript-eslint/no-unused-expressions
    socket.disconnected ? socket.connect() : socket.offAny()

    const eventKey = `server:new-points/${route_id}:list`
    const handleNewPoints = (data: { route_id: string; lat: number; lng: number }) => {
      const { route_id, lat, lng } = data
      if (!map.hasRoute(route_id)) {
        map.addRouteWithIcons({
          routeId: route_id,
          startMarkerOptions: {
            position: start_location,
          },
          endMarkerOptions: {
            position: end_location,
          },
          carMarkerOptions: {
            position: start_location,
          },
        })
      }
      map.moveCar(route_id, { lat, lng })
    }

    socket.on('connect', () => {
      console.log('connected')
      socket.emit(`client:new-points`, { route_id })
    })

    socket.on(eventKey, handleNewPoints)
  }, [route_id, start_location, end_location, map])

  return <div className="w-2/3 h-full" ref={mapContainerRef} />
}
