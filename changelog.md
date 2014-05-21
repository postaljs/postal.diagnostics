##v0.7.2

* Basically I published 0.7.1 without updating the lib directory. My bad. but npm no longer allows force publishing, so I had to cut a new version across all pkg managers this project is deployed to. Thanks npm.

##v0.7.1

* Replaced underscore dependency with lodash.
* Removed need to pass lodash to the factory function returned by the CommonJS module wrapper (you only have to pass postal now).
* Postal v0.9x and later no longer returns the envelope published from `postal.publish`, so tests were updated to reflect this.