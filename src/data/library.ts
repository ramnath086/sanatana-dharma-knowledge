export const libraryFilters = ['All', 'Vedas', 'Upaniṣads', 'Itihāsa', 'Purāṇas', 'Dharmaśāstra', 'Philosophy', 'Other'] as const
export type LibraryFilter = typeof libraryFilters[number]
