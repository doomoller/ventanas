<?php

require_once 'sitio/src/Main.php';
require_once 'sitio/src/Request.php';
require_once 'sitio/src/Renders.php';
require_once 'sitio/src/DB.php';

class AppBase   // base de las controladoras
{
	protected Main $main;
	protected DB $_db;
	protected $metas;
	protected $csrf;

	public function __construct(Main $main)
	{
		$this->main = $main;
		$this->metas = new Meta();
		$this->metas->setTitle("Muestra de Ventanas.");
	
		if(empty($_SESSION['csrf']))
		{
		    $_SESSION["csrf"] = substr(str_shuffle(md5(time().$_SERVER['REMOTE_ADDR'])),0, 30);
		}
		$this->csrf = $_SESSION["csrf"];
	}
	public function comprobarCSRF(array $post)
	{
		return (isset($post['csrf']) && $post['csrf'] == $_SESSION["csrf"]);
	}
	public function refrescar()
	{
	    header("Location: ". $_SERVER['REQUEST_URI']);
	    exit();
	}
	public function nofoundAction($msg = null)
	{
	    return $this->view(
	                   "sitio/layouts/default.phtml", 
	                   array("msg" => ($msg == null ? "La página no está disponible." : $msg)), 
	                   $this->metas, 
	                   "sitio/views/nofound.phtml", 
	                   404
	               );
	}
	public function errorAction($msg = null, $codigo = 503)
	{
	    return $this->view(
	                   "sitio/layouts/default.phtml", 
	                   array("msg" => ($msg == null ? "A ocurrido un error." : $msg)), 
	                   $this->metas, 
	                   "sitio/views/error.phtml", 
	                   $codigo
	               );
	}
	public function view($layout_file, $data, $metas, $vista_file, $codigo = 200)
	{
		$data['csrf'] = $this->csrf;
		if($this->main->getRequest()->isApi())
		{
			return new Response(new RenderJSON($data), $codigo);
		}

	    $l = new Layout($layout_file, $metas);
	    $l->setData($data);		
	    return new Response(new RenderPHP($data, $vista_file, $l), $codigo);
	}
	public function db()
	{
	    if(!isset($this->_db))
		{
			$this->_db = new DB($this->main->getDBConfig('dsn'), $this->main->getDBConfig('usuario'), $this->main->getDBConfig('clave'));
			if($this->_db->isErrors())
			{
				header("Location: http://".$_SERVER['SERVER_NAME']."/errorinterno.html");
			    exit();
			}
		}
	    return $this->_db;
	}
}


