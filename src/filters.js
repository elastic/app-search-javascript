function addPropertyIfKeysDoNotMatch(object, keyToAdd, valueToAdd, skipIfKey) {
  return {
    ...object,
    ...(keyToAdd !== skipIfKey && { [keyToAdd]: valueToAdd })
  };
}

function removeObjectsFromArrayIfTheyHaveKey(array, key) {
  return array.filter(arrayValue => {
    return !Object.entries(arrayValue).find(([valueKey]) => key === valueKey);
  });
}

export default class Filters {
  constructor(filtersJSON = {}) {
    this.filtersJSON = filtersJSON;
  }

  removeFilter(filterKey) {
    const filtersJSON = Object.entries(this.filtersJSON).reduce(
      (acc, [key, value]) => {
        if (!["all", "any", "none"].includes(key)) {
          return addPropertyIfKeysDoNotMatch(acc, key, value, filterKey);
        }
        return {
          ...acc,
          [key]: removeObjectsFromArrayIfTheyHaveKey(value, filterKey)
        };
      },
      {}
    );
    return new Filters(filtersJSON);
  }

  getListOfAppliedFilters() {
    const set = Object.entries(this.filtersJSON).reduce((acc, [key, value]) => {
      if (!["all", "any", "none"].includes(key)) {
        acc.add(key);
      } else {
        value.forEach(nestedValue => {
          Object.keys(nestedValue).forEach(nestedKey => {
            acc.add(nestedKey);
          });
        });
      }
      return acc;
    }, new Set());

    return Array.from(set.values());
  }
}
