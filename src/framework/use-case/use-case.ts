export type UseCase<TInput, TOutput> = (input: TInput) => TOutput;
export type AsyncUseCase<TInput, TOutput> = UseCase<TInput, Promise<TOutput>>;
