<?php
require_once __DIR__."/config.php";
require_once __DIR__."/secrets.php";

function getVmName($student)
{
    return VM_PREFIX . strtolower($student);
}

function getVmID($sessionId, $vmName)
{
    $url =
        "https://" .
        VCENTER_SERVER .
        "/rest/vcenter/vm?filter.names=" .
        urlencode($vmName);

    $curl = curl_init($url);

    curl_setopt_array($curl,[

        CURLOPT_RETURNTRANSFER=>true,

        CURLOPT_HTTPHEADER=>[
            "vmware-api-session-id: ".$sessionId
        ],

        CURLOPT_SSL_VERIFYHOST=>false,

        CURLOPT_SSL_VERIFYPEER=>false

    ]);

    $response=curl_exec($curl);

    curl_close($curl);
  
    $json = json_decode($response, true);

    if (!isset($json['value'])) {
        error_log("Unexpected response: " . $response);
        return null;
    }

    if (!is_array($json['value'])) {
        error_log("Invalid value field: " . $response);
        return null;
    }

    if (!isset($json['value'][0]['vm'])) {
        return null;
    }

    return $json['value'][0]['vm'];

}

function getGuestIP($sessionId, $vmId)
{
    $url =
        "https://" .
        VCENTER_SERVER .
        "/api/vcenter/vm/" .
        $vmId .
        "/guest/identity";

    $curl = curl_init($url);

    curl_setopt_array($curl,[

        CURLOPT_RETURNTRANSFER=>true,

        CURLOPT_HTTPHEADER=>[
            "vmware-api-session-id: ".$sessionId
        ],

        CURLOPT_SSL_VERIFYHOST=>false,

        CURLOPT_SSL_VERIFYPEER=>false

    ]);

    $response = curl_exec($curl);

    curl_close($curl);

    $json = json_decode($response,true);

    return $json['ip_address'] ?? null;
}
