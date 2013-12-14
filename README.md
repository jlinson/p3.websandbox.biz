p3.websandbox.biz
=================

Project 3 for DWA E-15: Javascript / jQuery demonstration web app. (a.k.a. Sudo Sudoku)

##Framework:##
The [Yii framework](http://www.yiiframework.com/ "Yii framework") was used for this application, however, very little of the framework was used. As with DWA Core, all requests are routed through an `index.php` file in the web root. While Yii and the DWA Core follow the same concepts, the specifics are different. The Yii components are organized as follows:

### Controllers - ###
The equivalenet of the DWA Core framework's `c_index.php` is the 'site' (default) controller, **`SiteController.php`**. The default controller was used exclusively and without modifications. That is why 'site' appears in all the URLs. 
**Location:**` /protected/controllers/`

### Views - ###
The equivalent of the DWA Core framework `_v_template` is what Yii calls a layout, file name, **`main.php`**. That file was modified with site-wide layout code.  

All site-wide css and javascript files are referenced in **`main.php`**. Some javascript, such as jQuery is considered 'core', so the use is 'registered' for inclusion in that layout file instead of using the standard `<script>` tag. (However, Yii renders the page with the standard tag.)   
**Location:**` /protected/views/layouts/main.php`  

The page specific content, equivalent to DWA Core's `v_index_index.php`, is called `index.php` and is located in the views folder under a folder corresponding to its applicable controller, 'site'. All the html for Sudo Sudoku is in that view file.  
**Location:**` /protected/views/site/index.php`  

The 'Contact' page was Yii generated and is located along side `index.php` (`protected/views/site/contact.php`). The 'About' page was also Yii generated and modified with content specific to this application. Since this is a static page, Yii places the file in a 'pages' folder under the controller views folder (`/protected/views/site/pages/about.php`).
#### css ####
The .css files are all located in `/css`. Yii uses the *Blueprint* css framework by default. The `main.css`, `print.css`, `screen.css`, `form.css` and `ie.css` files are all Blueprint files. I added the **`grid.css`** file to style the game grid. That css file is 'registered' in the `index.php` 'site' view to include the `<link>` on the rendered page. 
#### javascript ####
The .js files are all located in `/js`. My application javascript is separated into three files, **`grid.js`** (responsible for handling game grid input and validation), **`game.js`** (responsible for game button interaction and game load/save functionality), and **`preferences.js`** (responsible for handling preferences selections).  

Core framework javascript libraries are located elsewhere. I modified the Yii app configuration file, `/protected/config/main.php`, to use the Google CDN for jQuery v.1.10.2 and jQuery.ui v.1.10.3. JQuery was used throughout the game javascript files. The jQuery.ui accordian widget was used for the #sidebar Instructions / Preferences / Additional Information sections. 

### Models - ###
A MySQL database was not used in this application. For demonstration purposes, over ten game grids for each of five game difficulty levels were loaded into a multi-dimensional array for dynamic loading. This gameStore array is located in the **`game.js`** file.

### Application Functionality - ###
The application was designed for keyboard input of numbers into each cell. Entries are restricted to integers from 1 to 9. Handling 'paste' entries (either via Ctrl-V or context-menu) was particularly challenging and could not be prevented. The 'change' event was used to validate entries to trap invalid 'paste' entries.

Because game play on a mobile device does not lend itself to keyboard use (the keyboard takes up too much real estate, too), the `<input>`s can be removed in Preferences. This greatly simplifies the entry validation as all entries must be selected from the number bar below the grid. The number bar is always available for number entry, even in keyboard mode.

Although full game save functionality was not included for P3, the game level and last game loaded are saved (along with the keyboard setting) in HTML localStorage (if available). These settings are re-loaded when the site is revisited with the browser in use during last access.  
