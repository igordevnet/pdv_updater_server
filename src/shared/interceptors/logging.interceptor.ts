import { CallHandler, ExecutionContext, Injectable, Logger, NestInterceptor } from "@nestjs/common";
import { Observable } from "rxjs";

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
    private readonly logger = new Logger(LoggingInterceptor.name);

    intercept(context: ExecutionContext, next: CallHandler<any>): Observable<any> | Promise<Observable<any>> {
        const ctx = context.switchToHttp();
        const request = ctx.getRequest();
        const response = ctx.getResponse();

        const method = request.method;
        const url = request.url;
        const ip =request.ip;

        const deviceId = request.body?.deviceId || 'Unknown';

        const now = Date.now();

        response.on('finish', () => {
                const statusCode = response.statusCode;
                const delay = Date.now() - now;

                const logMessage = `${method} ${url} ${statusCode} - ${delay}ms - IP: ${ip} - Device: ${deviceId}`;

                if(statusCode >= 500) {
                    this.logger.error(logMessage);
                } else if (statusCode >= 400) {
                    this.logger.warn(logMessage);
                } else {
                    this.logger.log(logMessage);
                }
        })

        return next.handle();
    }
}