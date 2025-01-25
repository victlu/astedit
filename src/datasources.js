const DataSource = {
  "blank": [
  ],

  "logFiles": [
    { col: "FilePath", ty: "string" },
    { col: "RawData", ty: "string" },
    { col: "Computer", ty: "string" },
  ],

  "performanceCounters": [
    { col: "CounterName", ty: "string", desc: "e.g. \\Process(taskhostw#1)\\Virtual Bytes" },
    { col: "CounterValue", ty: "float" },
    { col: "SampleRate", ty: "int" },
    { col: "Counter", ty: "string", desc: "e.g. Process\\Virtual Bytes" },
    { col: "Instance", ty: "string" },
  ],

  "windowsEventLogs": [
    { col: "PublisherId", ty: "string" },
    { col: "TimeCreated", ty: "datetime" },
    { col: "PublisherName", ty: "string", desc: "e.g. Microsoft-Windows-Security-Auditing" },
    { col: "Channel", ty: "string" },
    { col: "LoggingComputer", ty: "string" },
    { col: "EventNumber", ty: "int" },
    { col: "EventCategory", ty: "int" },
    { col: "EventLevel", ty: "string" },
    { col: "UserName", ty: "string" },
    { col: "RawXml", ty: "string" },
    { col: "EventDescription", ty: "string" },
    { col: "RenderingInfo", ty: "string" },
    { col: "EventRecordId", ty: "int" },
  ],

  "customLogs": [
    { col: "FilePath", ty: "string" },
    { col: "RawData", ty: "string" },
  ],

  "iisLogs": [
    { col: "s_sitename", ty: "string" },
    { col: "s_computername", ty: "string" },
    { col: "s_ip", ty: "string" },
    { col: "cs_method", ty: "string" },
    { col: "cs_uri_stem", ty: "string" },
    { col: "cs_uri_query", ty: "string" },
    { col: "s_port", ty: "int" },
    { col: "cs_username", ty: "string" },
    { col: "c_ip", ty: "string", desc: "Client IP address" },
    { col: "cs_version", ty: "string" },
    { col: "cs_User_Agent", ty: "string" },
    { col: "cs_Cookie", ty: "string" },
    { col: "cs_Referer", ty: "string" },
    { col: "cs_host", ty: "string" },
    { col: "sc_status", ty: "int" },
    { col: "sc_substatus", ty: "int" },
    { col: "sc_win32_status", ty: "int" },
    { col: "sc_bytes", ty: "int" },
    { col: "cs_bytes", ty: "int" },
    { col: "time_taken", ty: "int" },
  ],

  "syslog": [
    { col: "Facility", ty: "string" },
    { col: "SeverityNumber", ty: "int" },
    { col: "EventTime", ty: "datetime" },
    { col: "HostIP", ty: "string" },
    { col: "Message", ty: "string" },
    { col: "ProcessId", ty: "string" },
    { col: "Severity", ty: "string" },
    { col: "Host", ty: "string" },
    { col: "ident", ty: "string" },
    { col: "Timestamp", ty: "datetime" },
  ],

  "windowsFirewallLogs": [
    { col: "date", ty: "datetime" },
    { col: "time", ty: "datetime" },
    { col: "action", ty: "string" },
    { col: "protocol", ty: "string" },
    { col: "src_ip", ty: "string" },
    { col: "dst_ip", ty: "string" },
    { col: "src_port", ty: "int" },
    { col: "dst_port", ty: "int" },
    { col: "size", ty: "int" },
    { col: "tcpflags", ty: "string" },
    { col: "tcpsyn", ty: "int" },
    { col: "tcpack", ty: "int" },
    { col: "tcpwin", ty: "int" },
    { col: "icmptype", ty: "int" },
    { col: "icmpcode", ty: "int" },
    { col: "info", ty: "string" },
    { col: "path", ty: "string" },
    { col: "pid", ty: "int" },
  ],
}

export default DataSource;
