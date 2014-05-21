##v0.7.1

* Replaced underscore dependency with lodash.
* Removed need to pass lodash to the factory function returned by the CommonJS module wrapper (you only have to pass postal now).
* Postal v0.9x and later no longer returns the envelope published from `postal.publish`, so tests were updated to reflect this.