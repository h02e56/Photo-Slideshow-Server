module.exports = {
	PORT: (process.env.NODE_ENV === 'production' ? 80 : 3000),
	WSPORT: (process.env.NODE_ENV === 'production' ? 80 : 8080),
	photosPath: './files/'
}