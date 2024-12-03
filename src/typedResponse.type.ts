export interface TypedResponse<T = unknown> extends Omit<Response, 'json'> {
  json: () => Promise<T>
}
