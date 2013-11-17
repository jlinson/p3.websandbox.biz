<?php

// uncomment the following to define a path alias
// Yii::setPathOfAlias('local','path/to/local-folder');

// This is the main Web application configuration. Any writable
// CWebApplication properties can be configured here.
return array(
	'basePath'=>dirname(__FILE__).DIRECTORY_SEPARATOR.'..',
	'name'=>'Sudo Sudoku (p3.websandbox.biz)',

	// preloading 'log' component
	'preload'=>array('log'),

	// autoloading model and component classes
	'import'=>array(
		'application.models.*',
		'application.components.*',
	),

	'modules'=>array(
		// uncomment the following to enable the Gii tool
		/* */
		'gii'=>array(
			'class'=>'system.gii.GiiModule',
			'password'=>'P3Gpwd4jblxx',
			// If removed, Gii defaults to localhost only. Edit carefully to taste.
			'ipFilters'=>array('127.0.0.1','::1'),
		),
		/* */
	),

	// application components
	'components'=>array(
		'user'=>array(
			// enable cookie-based authentication
			'allowAutoLogin'=>true,
		),
		// uncomment the following to enable URLs in path-format (sets CUrlManager properties)
		/* */
		'urlManager'=>array(
			'urlFormat'=>'path',
            'urlSuffix'=>'.html',
            'showScriptName'=>false,  // set to false to hide index.php
			'rules'=>array(
                //'<page:\w+>' => 'site/<page>',                                    // successfully hides 'site' - comment out to access /gii
                //'<controller:\w+>'=>'<controller>/list',                          // comment out to access /gii  (otherwise => cannot find '/gii/list'
                '<controller:\w+>/<id:\d+>'=>'<controller>/view',                   // distribution config
                '<controller:\w+>/<id:\d+>/<title>'=>'<controller>/view',
                '<controller:\w+>/<action:\w+>/<id:\d+>'=>'<controller>/<action>',  // distribution config
                '<controller:\w+>/<action:\w+>'=>'<controller>/<action>',           // distribution config
			),
		),
		/* */
        // uncomment the following to use a SQLite database
        /*
		'db'=>array(
			'connectionString' => 'sqlite:'.dirname(__FILE__).'/../data/testdrive.db',
		),
        */
		// uncomment the following to use a MySQL database
		/* */
		'db'=>array(
			'connectionString' => 'mysql:host=localhost;dbname=websandb_p3_websandbox_biz',
			'emulatePrepare' => true,
			'username' => 'websandb_p3',
			'password' => 'DevPwd4p3',
			'charset' => 'utf8',
		),
		/* */
		'errorHandler'=>array(
			// use 'site/error' action to display errors
			'errorAction'=>'site/error',
		),
		'log'=>array(
			'class'=>'CLogRouter',
			'routes'=>array(
				array(
					'class'=>'CFileLogRoute',
					'levels'=>'error, warning',
				),
				// uncomment the following to show log messages on web pages
				/* TODO: if (YII_DEBUG) - how do you dynamically add to array
				array(
					'class'=>'CWebLogRoute',
				),
				*/
			),
		),
	),

	// application-level parameters that can be accessed
	// using Yii::app()->params['paramName']
	'params'=>array(
		// this is used in contact page
		'adminEmail'=>'jlinson@g.harvard.edu',
	),
);