export interface Node<T>{
    data: T;
    children: Node<T>[];
}