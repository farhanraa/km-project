<?php
use \FileRun\WebLinks;

class custom_creative_cloud extends \FileRun\Files\Plugin {

	var $online = true;
	static $localeSection = "Custom Actions: Creative Cloud";

	function init() {
		$this->JSconfig = [
			"title" => self::t("Creative Cloud"),
			"iconCls" => 'fa fa-fw fa-cloud', 'icon' => 'images/icons/creative_cloud.png',
			"extensions" => ["jpg", "jpeg", "png"],
			"popup" => true,
			"requiredUserPerms" => ["download"],
			"requires" => ["download"]
		];
		$this->outputName = "imageOutput";
	}

	function run() {
		$data = $this->prepareRead(['expect' => 'file']);
		$weblinkInfo = WebLinks::createForService($data['fullPath'], 2, $data['shareInfo']['id']);
		if (!$weblinkInfo) {
			self::outputError('Failed to setup weblink', 'html');
		}
		$this->data['fileURL'] = WebLinks::getURL(["id_rnd" => $weblinkInfo['id_rnd']]);
		$this->data['saveURL'] = WebLinks::getSaveURL($weblinkInfo['id_rnd'], false, "creative_cloud");
		$fileName = $data['alias'] ?: \FM::basename($data['fullPath']);
		require($this->path."/display.php");
		\FileRun\Log::add(false, "preview", [
			"relative_path" => $data['relativePath'],
			"full_path" => $data['fullPath'],
			"method" => "Creative Cloud"
		]);
	}

	function saveRemoteChanges() {
		$fromURL = S::fromHTML($_REQUEST['fromURL']);
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
			'logging' => ['details' => ['method' => 'Creative Cloud']]
		]);

		echo 'File successfully saved';
	}
}