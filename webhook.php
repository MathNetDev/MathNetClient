<?php

$hookSecret = trim(file_get_contents("/var/www/html/.webhook_secret"));

if($hookSecret !== NULL)
{
  if(!isset($_SERVER["HTTP_X_HUB_SIGNATURE"]))
  {
    exit("HTTP header 'X-Hub-Signature' is missing.");
  }
  else if(!extension_loaded("hash"))
  {
    exit("Missing 'hash' extension to check the secret code validity.");
  }
  list($algo, $hash) = explode("=", $_SERVER["HTTP_X_HUB_SIGNATURE"], 2) + array("", "");

  if(!in_array($algo, hash_algos(), TRUE))
  {
    exit("Hash algorithm '$algo' is not supported.");
  }
  $rawPost = file_get_contents("php://input");

  if($hash !== hash_hmac($algo, $rawPost, $hookSecret))
  {
      exit("Hook secret does not match.");
  }
};

switch(strtolower($_SERVER["HTTP_X_GITHUB_EVENT"]))
{
  case "ping":
    echo "pong";
    break;
  case "push":
    // Get the current user. Pull the repo, kill node and start it again
    $user = get_current_user();
    if($user == "mathdev"){
      system("cd /var/www/html/live/MathNetClient && git checkout dev && git reset HEAD --hard && git pull origin dev", $dummy);
      system("cd /var/www/html/live/MathNetServer && git checkout master && git reset HEAD --hard && git pull origin dev", $dummy);
      system("killall node");
      system("/usr/bin/node /var/www/html/dev/MathNetServer/server.js 8887 &");
    }
    if($user == "mathtest") {
      system("cd /var/www/html/live/MathNetClient && git checkout test && git reset HEAD --hard && git pull origin test", $dummy);
      system("cd /var/www/html/live/MathNetServer && git checkout master && git reset HEAD --hard && git pull origin test", $dummy);
      system("killall node");
      system("/usr/bin/node /var/www/html/test/MathNetServer/server.js 8888 &");
    }
    if($user == "mathlive") {
      system("cd /var/www/html/live/MathNetClient && git checkout master && git reset HEAD --hard && git pull origin master", $dummy);
      system("cd /var/www/html/live/MathNetServer && git checkout master && git reset HEAD --hard && git pull origin master", $dummy);
      system("killall node");
      system("/usr/bin/node /var/www/html/live/MathNetServer/server.js 8889 &");
    }
    break;
  default:
    header("HTTP/1.0 404 Not Found");
    echo "Event:$_SERVER[HTTP_X_GITHUB_EVENT] Payload:\n";
    print_r($payload); # For debug only. Can be found in GitHub hook log.
    exit;
    break;
}