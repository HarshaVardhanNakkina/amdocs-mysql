module.exports = {
	proxy: 'localhost:3030',
	files: ['**/*.css', '**/*.html', '**/*.js'],
	ignore: ['node_modules'],
	reloadDelay: 10,
	ui: false,
	notify: false,
	port: 3031
}
