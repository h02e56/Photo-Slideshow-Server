photo slideshow server 
=====
A non sense(?) and unnecessary(?) photo slideshow server. 
Just do this for practice and fun and for my brother birthay projections.


The server will read your configurated photos folder and create a menu for the client based in folders inside the provided photos folder(depending)
. Just planned 1 level folder deep...need to do better this part to do something more interesting

## Basic usage

###Configuration

Edit config.js, most important:
	* 'photosPath'
	* 'intervalTime' in milliseconds,

```js
module.exports = {
	PORT: (process.env.NODE_ENV === 'production' ? 80 : 3000),
	WSPORT: (process.env.NODE_ENV === 'production' ? 80 : 8080),
	photosPath: './files/',//shoud change to your path
	intervalTime: 7000
}
```
## Usage

```sh
$ node server
```

## LICENSE

MIT license, read [LICENSE file](https://raw.githubusercontent.com/ifraixedes/gitevents-mailer/master/LICENSE) for more information.


