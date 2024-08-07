<?php
/**
 * Plugin Name:       My Plugin | 我的 WordPress 外掛
 * Plugin URI:        https://cloud.luke.cafe/plugins/
 * Description:       這是一個 WordPress 外掛的範本，可以用來開發新的外掛。
 * Version:           4.0.4
 * Requires at least: 5.7
 * Requires PHP:      8.
 * Author:            J7
 * Author URI:        https://github.com/j7-dev
 * License:           GPL v2 or later
 * License URI:       https://www.gnu.org/licenses/gpl-2.0.html
 * Text Domain:       my_plugin
 * Domain Path:       /languages
 * Tags:
 */

declare (strict_types = 1);

namespace J7\WpPlugin;

if ( ! \class_exists( 'J7\WpPlugin\Plugin' ) ) {
	require_once __DIR__ . '/vendor/autoload.php';

	/**
		* Class Plugin
		*/
	final class Plugin {
		use \J7\WpUtils\Traits\PluginTrait;
		use \J7\WpUtils\Traits\SingletonTrait;

		/**
		 * Constructor
		 */
		public function __construct() {
			require_once __DIR__ . '/inc/class/class-bootstrap.php';

			// $this->required_plugins = array(
			// array(
			// 'name'     => 'WooCommerce',
			// 'slug'     => 'woocommerce',
			// 'required' => true,
			// 'version'  => '7.6.0',
			// ),
			// array(
			// 'name'     => 'WP Toolkit',
			// 'slug'     => 'wp-toolkit',
			// 'source'   => 'Author URL/wp-toolkit/releases/latest/download/wp-toolkit.zip',
			// 'required' => true,
			// ),
			// );

			$this->init(
				[
					'app_name'    => 'My Plugin',
					'github_repo' => 'https://github.com/j7-dev/wp-plugin',
					'callback'    => [ Bootstrap::class, 'instance' ],
				]
			);
		}
	}

	Plugin::instance();
}
