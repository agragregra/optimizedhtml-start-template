<h1>OptimizedHTML - Start HTML Template</h1>

<p>
	<img src="https://raw.githubusercontent.com/agragregra/optimizedhtml-start-template/master/app/img/preview.jpg" alt="Start HTML Template">
</p>

<p>Author: <a href="https://webdesign-master.ru" target="_blank">WebDesign Master</a> | <a href="https://webdesign-master.ru/blog/tools/optimizedhtml.html" target="_blank">Manual</a></p>

<p>OptimizedHTML is all-inclusive, optimized for Google PageSpeed start HTML5 template with Bootstrap (grid only), Gulp, Sass, Browsersync, Autoprefixer, PostCSS, Uglify, gulp-imagemin, Vinyl-FTP, rsync and Bower (libs path) support. The template contains a <strong>.htaccess</strong> file with caching rules for web server.</p>

<p>OptimizedHTML Start Template uses the best practices of web development and optimized for Google PageSpeed.</p>

<p>The template uses a Sass with <strong>Sass</strong> syntax and project structure with source code in the directory <strong>app/</strong> and production folder <strong>dist/</strong>, that contains ready project with optimized HTML, CSS, JS and images.</p>

<h2>How to use OptimizedHTML</h2>

<ol>
	<li><a href="https://github.com/agragregra/optimizedhtml-start-template/archive/master.zip">Download</a> <strong>optimizedhtml-start-template</strong> from GitHub</li>
	<li>Install WSL (for Windows): <a href="https://webdesign-master.ru/blog/tools/wsl-nodejs-new.html" target="_blank">https://webdesign-master.ru/blog/tools/wsl-nodejs-new.html</a></li>
	<li>Install Node Modules in project folder: <code>npm i</code></li>
	<li>Run the template: <code>gulp</code></li>
</ol>

<h2>Gulp tasks:</h2>

<ul>
	<li><strong>gulp</strong>: run default gulp task (sass, js, watch, browserSync) for web development;</li>
	<li><strong>build</strong>: build project to <strong>dist</strong> folder (cleanup, image optimize, removing unnecessary files);</li>
	<li><strong>deploy</strong>: project deployment on the server from <strong>dist</strong> folder via <strong>FTP</strong>;</li>
	<li><strong>rsync</strong>: project deployment on the server from <strong>dist</strong> folder via <strong>RSYNC</strong>;</li>
	<li><strong>clearcache</strong>: clear all gulp cache.</li>
</ul>

<h2>Rules for working with the starting HTML template</h2>

<ol>
	<li>All HTML files should have similar initial content as in <strong>app/index.html</strong>;</li>
	<li>For installing new JS library, just run the command "<strong>bower i plugin-name</strong>" in the terminal. Libraries are automatically placed in the folder <strong>app/libs</strong>. Bower must be installed in the system (npm i -g bower). Then place all JS libraries paths in the <strong>js()</strong> task (gulpfile.js);</li>
	<li>All custom JS located in <strong>app/js/common.js</strong>;</li>
	<li>All Sass vars placed in <strong>app/sass/_vars.sass</strong>;</li>
	<li>All Fonts placed in <strong>app/sass/_fonts.sass</strong> with "_mixins/font-face" mixin</li>
	<li>All Bootstrap media queries placed in <strong>app/sass/_media.sass</strong>;</li>
	<li>All JS libraries CSS styles placed in <strong>app/sass/_libs.sass</strong>;</li>
</ol>
