import { Controller, Get, Route } from 'tsoa';

@Route("ping")
export class PingController extends Controller {
  @Get("/")
  public async ping(): Promise<{ status: string }> {
    return { status: "ok" };
  }
}