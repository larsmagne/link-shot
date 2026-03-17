<?php
/*
Plugin Name: Link Shot
Description: Display cached screenshots of linked sites
*/

function link_shot_add_files() {
  wp_enqueue_style("link-shot-css",
                   "/wp-content/plugins/link-shot/link-shot.css");
  wp_enqueue_script("link-shot-js",
                    "/wp-content/plugins/link-shot/link-shot.js");
}

add_action("wp_enqueue_scripts", "link_shot_add_files");
