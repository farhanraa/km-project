<?php
use \FileRun\WebLinks;

class custom_pixlr extends \FileRun\Files\Plugin {

	var $online = true;
	static $localeSection = "Custom Actions: Pixlr";

	function init() {
		$this->JSconfig = [
			"title" => self::t("Pixlr"),
			'icon' => 'images/icons/pixlr.png',
			"extensions" => ["jpg", "jpeg", "gif", "png", "psd", "bmp", "pxd"],
			"popup" => true, "external" => true,
			"requires" => ["download"],
			"requiredUserPerms" => ["download"],
			"createNew" => [
				"title" => self::t("Image with Pixlr"),
				"defaultFileName" => self::t("Untitled.png")
			]
		];
		$this->outputName = "image";
	}

	function run() {
		$data = $this->prepareRead(['expect' => 'file']);
		$weblinkInfo = WebLinks::createForService($data['fullPath'], 2, $data['shareInfo']['id']);
		if (!$weblinkInfo) {
			self::outputError('Failed to setup weblink', 'html');
		}
		$this->data['fileURL'] = WebLinks::getURL(["id_rnd" => $weblinkInfo['id_rnd']]);
		$this->data['saveURL'] = WebLinks::getSaveURL($weblinkInfo['id_rnd'], false, "pixlr");

		$url = "https://apps.pixlr.com/editor/";
		//$url .= "?method=POST";
		$url .= "?image=".urlencode($this->data['fileURL']);
		$url .= "&referrer=".urlencode($config['settings']['app_title']);
		$url .= "&target=".urlencode($this->data['saveURL']);
		$url .= "&title=".urlencode($this->data['fileName']);
		$url .= "&redirect=false";
		$url .= "&locktitle=true";
		$url .= "&locktype=true";
		header('Location: '.$url);

		\FileRun\Log::add(false, "preview", [
			"relative_path" => $data['relativePath'],
			"full_path" => $data['fullPath'],
			"method" => "Pixlr"
		]);
	}

	function createBlankFile() {
		$this->writeFile([
			'source' => 'copy',
			'sourceFullPath' => gluePath($this->path, "blank.png"),
			'logging' => ['details' => ['method' => 'Pixlr']]
		]);
		jsonFeedback(true, 'Blank image created successfully');
	}

	function saveRemoteChanges() {
		$fromURL = S::fromHTML($_GET['image']);
		if (!$fromURL) {
			$this->outputError('No URL specified', 'text');
		}

		$contents = @file_get_contents($fromURL);
		if ($contents === false) {
			$this->outputError(error_get_last()['message'], 'text');
		}

		if (!$contents) {
			$this->outputError('Empty contents.', 'text');
		}

		$this->writeFile([
			'source' => 'string',
			'contents' => $contents,
			'logging' => ['details' => ['method' => 'Pixlr']]
		]);

		echo 'File successfully saved';
	}

}