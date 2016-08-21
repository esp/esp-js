<a name="installation"></a>

# Installation

## JavaScript

Install from npm:

````
npm install esp-js --save.
```
usage:

``` js
import esp from 'esp-js';
var router = new esp.Router();

// or
import { Router } from 'esp-js';
var router = new Router();
 
```

## .Net

All the [ESP packages](https://www.nuget.org/profiles/esp) are hosted on nuget.

Install the main package:

```
Install-Package esp-net
```

Alternatively install the source package:

```
Install-Package esp-net-source
```

If you required some additional dispatcher (to enable the router to run on a dedicated [thread](../advanced-concepts/multithreading.md)) support install the dispatchers package:

```
Install-Package esp-net-dispatchers
```

This is also available as a source only package:

```
Install-Package esp-net-dispatchers-source
```

Symbols for binary packages are pushed to [symbolsource.org](http://symbolsource.org/).