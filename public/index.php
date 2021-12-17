<?php

if (!empty($_SERVER['APPLICATION_ENV']) && $_SERVER['APPLICATION_ENV'] == 'development') {
	error_reporting(E_ALL);
	ini_set("display_errors", 1);
	

	function exception_error_handler($severity, $message, $file, $line) {
	    if (!(error_reporting() & $severity))return;
	    
	    throw new ErrorException($message, 0, $severity, $file, $line);
	}
	set_error_handler("exception_error_handler", E_ALL);
	
}
else
{
	error_reporting(0);
	ini_set("display_errors", 0);
}
chdir(dirname(__DIR__));
require_once "sitio/src/Main.php";

$opts = array(
        'tiemposesion' => 600,  //minutos
		'routers' => array(
		    'home' 	=> array(
		        'controller' 		=> 'Ventanas',
		        'controller_path'	=> 'sitio/controllers/Ventanas.php',
		        'default'			=> 'ver',
		    ),
		    'no-found' 	=> array(
		        'controller' 		=> 'Ventanas',
		        'controller_path'	=> 'sitio/controllers/Ventanas.php',
		        'default'			=> 'nofound',
		    ),
		    'ventanas' 	=> array(
		        'controller' 		=> 'Ventanas',
		        'controller_path'	=> 'sitio/controllers/Ventanas.php',
		        'default'			=> 'ver',
				'match'				=> '/ver|guardar|borrar/',
		    ),
		    'usuarios' 	=> array(
		        'controller' 		=> 'Usuarios',
		        'controller_path'	=> 'sitio/controllers/Usuarios.php',
		        'default'			=> 'ver',
				'match'				=> '/ver|listado/',
		    ),
			'objeto'	=> array(
		        'controller' 		=> 'Ventanas',
		        'controller_path'	=> 'sitio/controllers/Ventanas.php',
		        'default'			=> 'describir',
		        'match'				=> '/describir|opciones/',
		    ),
		),
		'layout' => 'sitio/layouts/default.phtml',
		'db' => 'sitio/config/db-local.ini',
		);

$c = new Main($opts);
$c->run();