import {
  APIGatewayProxyEvent,
  Context,
  APIGatewayProxyResult,
  APIGatewayProxyHandler,
  Callback,
} from 'aws-lambda';

export type AppHandler<Result> = (
  event: APIGatewayProxyEvent,
  context: Context,
  callback: Callback<APIGatewayProxyResult>
) => Promise<Result>;

const wrap =
  <T>(fn: AppHandler<T>): APIGatewayProxyHandler =>
  (...args) =>
    fn(...args)
      .then((res) => ({
        statusCode: 200,
        body: JSON.stringify(res),
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Content-Type': 'application/json',
        },
      }))
      .catch((e) => ({
        statusCode: 400,
        body: JSON.stringify(e),
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Content-Type': 'application/json',
        },
      }));

export default wrap;
