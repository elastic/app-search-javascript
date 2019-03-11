/**
 * A helper for working with the JSON structure which represent
 * filters in API requests.
 */
export default class Filters {
  constructor(filtersJSON = {}) {
    this.filtersJSON = filtersJSON;
  }

  removeFilter(filterKey, filtersMap = this.filtersJSON) {
    function go(filterKey, filtersMap) {
      const filtered = Object.entries(filtersMap).reduce(
        (acc, [filterName, filterValue]) => {
          if (filterName === filterKey) {
            return acc;
          }

          if (["all", "any", "none"].includes(filterName)) {
            const nestedFiltersArray = filterValue;
            filterValue = nestedFiltersArray.reduce((acc, nestedFiltersMap) => {
              const updatedNestedFiltersMap = go(filterKey, nestedFiltersMap);
              if (updatedNestedFiltersMap) {
                return acc.concat(updatedNestedFiltersMap);
              } else {
                return acc;
              }
            }, []);
          }

          return {
            ...acc,
            [filterName]: filterValue
          };
        },
        {}
      );

      if (Object.keys(filtered).length === 0) {
        return;
      }
      return filtered;
    }

    const filtered = go(filterKey, filtersMap);
    return new Filters(filtered);
  }

  getListOfAppliedFilters(filters = this.filtersJSON) {
    const set = Object.entries(filters).reduce((acc, [key, value]) => {
      if (!["all", "any", "none"].includes(key)) {
        acc.add(key);
      } else {
        value.forEach(nestedValue => {
          Object.keys(nestedValue).forEach(nestedKey => {
            if (!["all", "any", "none"].includes(nestedKey)) {
              acc.add(nestedKey);
            } else {
              acc = new Set([
                ...acc,
                ...this.getListOfAppliedFilters(nestedValue)
              ]);
            }
          });
        });
      }
      return acc;
    }, new Set());

    return Array.from(set.values());
  }
}
