package internal

import "time"

type RouteCreatedEvent struct {
	EventName string `json:"event"`
	RouteID string `json:"id"`
	Distance int `json:"distance"`
	Diretions []Directions `json:"directions"`
}

func NewRouteCreatedEvent(routeID string, distance int, directions []Directions) *RouteCreatedEvent {
	return &RouteCreatedEvent{
		EventName: "RouteCreated",
		RouteID: routeID,
		Distance: distance,
		Diretions: directions,
	}
}

type FreightPriceCalculatedEvent struct {
	EventName string `json:"event"`
	RouteID string `json:"route_id"`
	Amount float64 `json:"amount"`
}

func NewFreightCalculatedEvent(routeID string, amount float64) *FreightPriceCalculatedEvent {
	return &FreightPriceCalculatedEvent{
		EventName: "FreightCalculated",
		RouteID: routeID,
		Amount: amount,
	}
}

type DeliveryStartedEvent struct {
	EventName string `json:"event"`
	RouteID string `json:"route_id"`
}

func NewDeliveryStartedEvent(routeID string) *DeliveryStartedEvent {
	return &DeliveryStartedEvent{
		EventName: "DeliveryStarted",
		RouteID: routeID,
	}
}

type DriverMovedEvent struct {
	EventName string `json:"event"`
	RouteID string `json:"route_id"`
	Lat float64 `json:"lat"`
	Lng float64 `json:"lng"`
}

func NewDriverMovedEvent(routeID string, lat, lng float64) *DriverMovedEvent {
	return &DriverMovedEvent{
		EventName: "DriverMoved",
		RouteID: routeID,
		Lat: lat,
		Lng: lng,
	}
}

func RouteCreatedHandler(event *RouteCreatedEvent, routeService *RouteService)(*FreightPriceCalculatedEvent, error) {
	route := NewRoute(event.RouteID, event.Distance, event.Diretions)
	routeCreated, err := routeService.CreateRoute(route)
	if err != nil {
		return nil, err
	}

	freightCalculatedEvent := NewFreightCalculatedEvent(routeCreated.ID, routeCreated.FreightPrice)
	return freightCalculatedEvent, nil
}

func DeliveryStartedHandler(event *DeliveryStartedEvent, routeService *RouteService, channel chan *DriverMovedEvent) error {
	route, err := routeService.GetRoute(event.RouteID)
	if err != nil {	
		return err
	}

	driverMovedEvent := NewDriverMovedEvent(route.ID, 0, 0)

	for _, direction := range route.Directions {
		driverMovedEvent.RouteID = route.ID
		driverMovedEvent.Lat = direction.Lat
		driverMovedEvent.Lng = direction.Lng
		time.Sleep(time.Second)
		channel <- driverMovedEvent
	}
	return nil
}