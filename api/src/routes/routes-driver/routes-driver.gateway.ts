import { SubscribeMessage, WebSocketGateway } from '@nestjs/websockets';
import { RoutesService } from '../routes.service';

@WebSocketGateway({
  cors: {
    origin: '*',
  },
})
export class RoutesDriverGateway {
  constructor(private routesService: RoutesService) {}

  @SubscribeMessage('client:new-points')
  async handleMessage(client: any, payload: any) {
    const { route_id } = payload;
    const route = await this.routesService.findOne(route_id);
    //@ts-expect-error - routes has not been defined
    const { steps } = route.directions.routes[0].legs[0];
    for (const step of steps) {
      const { lat: start_lat, lng: start_lng } = step.start_location;
      client.emit(`server:new-points/${route_id}:list`, {
        route_id,
        lat: start_lat,
        lng: start_lng,
      });
      client.broadcast.emit('server:new-points:list', {
        route_id,
        lat: start_lat,
        lng: start_lng,
      });
      await sleep(2000);
      const { lat: end_lat, lng: end_lng } = step.end_location;
      client.emit(`server:new-points/${route_id}:list`, {
        route_id,
        lat: end_lat,
        lng: end_lng,
      });
      client.broadcast.emit('server:new-points:list', {
        route_id,
        lat: end_lat,
        lng: end_lng,
      });
      await sleep(2000);
    }
  }
}

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));
