<?php
/* @var $this SiteController */

$this->pageTitle=Yii::app()->name . ' - About';
$this->breadcrumbs=array(
	'About',
);
?>
<h1>About</h1>

<p>
    This application was created as a demonstration of javascript / jQuery in fulfillment of the requirements for
    project P3 for the Harvard Extension class, Dynamic Web Applications (DWA E-15). Although the bulk of the project
    involves jQuery and raw javascript, the app was built using the <a href="http://www.yiiframework.com/" class="external">
    Yii Framework v.1.1.14</a> in anticipation of using the framework for the subsequent P4 project. The Yii Framework
    uses CSS developed by <a href="http://blueprintcss.org/" class="external">Blueprint</a>. That css framework was
    lightly modified to style this exercise. However, the intention is to incorporate elements of
    <a href="http://getbootstrap.com/" class="external"> Twitter Bootstrap</a> in future Yii projects.
</p><p>
    All the game grid styling is in a custom grid.css file. All the application javascript is sub-divided into three
    script files, grid.js (handles grid input), game.js (handles game loading and saving), and preferences.js (handles
    preferences selections).
</p>
    The following jQuery libraries were also used:
    <ul>
        <li><a href="http://jquery.com/" class="external">jQuery</a> - v.1.10.2</li>
        <li><a href="http://jqueryui.com/" class="external">jQuery.ui</a> - v.1.10.3</li>
    </ul>
<br>