<?php

class DB extends PDO
{
	private $pdo = null;
	private $errors = '';
	
	
	public function __construct($s, $u, $p)
	{
		try
		{
			parent::__construct($s, $u, $p, array(
						PDO::MYSQL_ATTR_INIT_COMMAND => "SET NAMES utf8",
			    PDO::ATTR_ERRMODE => PDO::ERRMODE_WARNING, // ERRMODE_WARNING o ERRMODE_EXCEPTION
				));
		}
		catch(PDOException $e)
		{
			$this->errors = $e->getMessage();
		}
	}
	public function select(Select $_select, $bind = null)
	{	
	    $r = new SelectResult();
		try 
		{
			$s = $this->prepare($_select->getQuery(), array(PDO::ATTR_CURSOR => PDO::CURSOR_SCROLL));
			if($s === false){$r->error = true; return $r;}
			$s->execute($bind == null ? array() : $bind);
			$r->count = $s->rowCount();
			$r->data = $s->fetchAll(PDO::FETCH_OBJ);
			return $r;
		}
		catch(PDOException $e)
		{
			$this->errors = $e->getMessage();
		}
		return $r;		
	}
	public function rawSelect($q)
	{
	    $r = new SelectResult();
		try
		{
			$s = $this->query($q);
			if($s === false){$r->error = true; return $r;}
			$r->count = $s->rowCount();
			$r->data = $s->fetchAll(PDO::FETCH_OBJ);
			return $r;
		}
		catch(PDOException $e)
		{
			$this->errors = $e->getMessage();
		}
		return $r;
	}
	public function rawUpdate($q)
	{
		try
		{
			$s = $this->query($q);
			if($s === false){return 0;}
			return $s->rowCount();
		}
		catch(PDOException $e)
		{
			$this->errors = $e->getMessage();
		}
		return 0;
	}
	public function delete($table, $where, array $bind)
	{
		try
		{
			$s = $this->prepare("DELETE FROM $table WHERE $where");
			if($s === false)return 0;
			$s->execute($bind);
			return $s->rowCount();
		}
		catch(PDOException $e)
		{
			$this->errors = $e->getMessage();
		}		
		return 0;
	}
	public function selectCount(Select $_select, $bind = null)
	{	
	    $r = new SelectResult();
		try 
		{
			$s = $this->prepare($_select->getQuery(), array(PDO::ATTR_CURSOR => PDO::CURSOR_SCROLL));
			if($s === false){$r->error = true; return $r;}
			$s->execute($bind == null ? array() : $bind);
			$r = $s->fetch();
			if(isset($r['count(*)']))return intval($r['count(*)']);
		}
		catch(PDOException $e)
		{
			$this->errors = $e->getMessage();
		}
		return 0;		
	}
	public function count($table, $where = null, array $bind = null)
	{
		try
		{
			$s = $this->prepare("SELECT count(*) FROM $table" . ($where != null ? " WHERE $where" : ""));
			if($s === false)return 0;
			$s->execute($where != null && is_array($bind) ? $bind : array());
			$r = $s->fetch();
			if(isset($r['count(*)']))return intval($r['count(*)']);
		}
		catch(PDOException $e)
		{
			$this->errors = $e->getMessage();
		}		
		return 0;
	}
	public function rawCount($q)
	{
		try
		{
			$s = $this->query($q);
			if($s === false)return 0;
			$s->execute();
			$r = $s->fetch();
			if(isset($r['count(*)']))return intval($r['count(*)']);
		}
		catch(PDOException $e)
		{
			$this->errors = $e->getMessage();
		}		
		return 0;
	}
	public function insert($table, array $data)
	{
		try
		{
			$q = "INSERT INTO $table (";
			$qv = " VALUES (";
			$bind = array();
			foreach($data as $k => $v)
			{
				$q .= "$k,";
				$qv .= ":$k,";
				$bind[$k] = $v;
			}
			$q = substr($q, 0, strlen($q) - 1);
			$q .= ")";
			$qv = substr($qv, 0, strlen($qv) - 1);
			$qv .= ")";
			$q = $q . $qv;
			
			$s = $this->prepare($q);
			if($s === false)
			{
			    $this->errors = $this->getErrors();
			    return 0;
			}
			$s->execute($bind);
			return $s->rowCount();
		}
		catch(PDOException $e)
		{
			$this->errors = $e->getMessage();
		}
		return 0;		
	}
	public function update($table, array $data, $where = null, array $bind_where = null)
	{
		try
		{
			$q = "UPDATE $table SET ";
			$bind = array();
			foreach($data as $k => $v)
			{
				$q .= "$k = :$k,";
				$bind[$k] = $v;
			}
			$q = substr($q, 0, strlen($q) - 1);
			if($where != null){$q .= " WHERE $where";}
			if($bind_where != null){$bind = array_merge($bind, $bind_where);}
			$s = $this->prepare($q);
			if($s === false)
			{
			    $this->errors = $this->getErrors();
			    return 0;
			}
			$s->execute($bind);
			return $s->rowCount();
		}
		catch(PDOException $e)
		{
			$this->errors = $e->getMessage();
		}
		return 0;		
	}
	public function getErrors(){return $this->errors;}
	public function isErrors() {return !empty($this->errors);}
}
class SelectResult
{
	public $error = false;
	public $count = 0;
	public $data = null;
}
class Select
{
	private $q;
	private $t;
	private $f;
	private $j;
	private $w;
	private $o;
	private $l;
	private $ord;
	
	public function __construct($table, $fields="*", $join=null, $where=null, $offset = 0, $limit = 99999999, $order = null)
	{
		$this->t = $table;
		$this->f = $fields;
		$this->j = $join;
		$this->w = $where;
		$this->o = $offset;
		$this->l = $limit;
		$this->ord = $order;
	}
	private function buildQuery()
	{
		$q = "SELECT " . $this->f . " FROM " . $this->t;
		if($this->j != null)$q .= " ".$this->j." ";
		if($this->w != null)$q .= " WHERE " . $this->w;
		if($this->ord != null)$q .= " ORDER BY $this->ord";
		$q .= " LIMIT $this->o, $this->l";
		$this->q = $q;		
	}
	
	public function getQuery(){$this->buildQuery();return $this->q;}
	public function getTable(){return $this->t;}
	public function getFields(){return $this->f;}
	public function getWhere(){return $this->w;}
	public function getOffset(){return $this->o;}
	public function getLimit(){return $this->l;}
	public function getOrder(){return $this->ord;}
	
	public function setTable($_p){$this->t = $_p;}
	public function setFields($_p){$this->f = $_p;}
	public function setWhere($_p){$this->w = $_p;}
	public function setOffset($_p){$this->o = $_p;}
	public function setLimit($_p){$this->l = $_p;}
	public function setOrder($_p){$this->ord = $_p;}
}