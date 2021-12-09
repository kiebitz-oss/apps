export type ActionStatus =
    | 'loaded'
    | 'undefined'
    | 'invalid'
    | 'initialized'
    | 'succeeded'
    | 'failed';

export interface Result<Data = any> {
    data: Data;
    status: ActionStatus;
}
