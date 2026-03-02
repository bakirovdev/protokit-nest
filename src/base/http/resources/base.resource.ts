type AbstractConstructor<T> = abstract new (data: any) => T;

export abstract class BaseResource<T = any> {
  constructor(protected readonly data: T) {}

  static make<R extends BaseResource<any>>(
    this: AbstractConstructor<R>,
    data: R extends BaseResource<infer D> ? D : any,
  ): ReturnType<R['toJSON']> {
    return new (this as any)(data).toJSON();
  }

  static collection<R extends BaseResource<any>>(
    this: AbstractConstructor<R>,
    data: Array<R extends BaseResource<infer D> ? D : any>,
  ): Array<ReturnType<R['toJSON']>> {
    return data.map(item => new (this as any)(item).toJSON());
  }

  toJSON(): any {
    return this.data;
  }
}
