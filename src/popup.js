document.addEventListener('DOMContentLoaded', function()
{
	var copyButton = document.getElementById('btnCopy');
	var pasteButton = document.getElementById('btnPaste');
	var copySelectedButton = document.getElementById('btnCopySelected');
	
	var queryObj = getTabQueryObj();
	queryObj.highlighted = true;
	chrome.tabs.query(queryObj, function(tabs)
	{
		if (tabs.length <= 1)
		{
			copySelectedButton.style.display = 'none';
		}
		else
		{
			copySelectedButton.focus();
			copySelectedButton.addEventListener('click', function() {
				var qo = getTabQueryObj();
				qo.highlighted = true;
				CopyTabs(qo);
			});
		}
	});
	
	copyButton.addEventListener('click', function() {
		CopyTabs(getTabQueryObj())
	});
	
	pasteButton.addEventListener('click', function()
	{
		var text = getClipboardText();
		var lines = text.split('\n');
		var splitWindows = document.getElementById('chkMultiWindow').checked;
		if (splitWindows)
		{
			chrome.windows.getCurrent(function(wind)
			{
				var currentIncognito = wind.incognito;
				var arr = [];
				for (var i = 0; i <= lines.length ; i++)
				{
					if (i == lines.length || lines[i].length == 0)
					{
						chrome.windows.create({incognito: currentIncognito, url: arr}, function(wind)
						{
							wId = wind.id;
						});
						arr = [];
					}
					else
					{
						arr.push(lines[i]);
					}
				}
			});
		}
		else
		{
			for (var i = 0; i < lines.length; i++)
			{
				var current = lines[i];
				if (current.length > 0)
				{
					chrome.tabs.create({ url: current });
				}
			}
		}
	});
}, false);

function CopyTabs(queryObject) {
	chrome.tabs.query(queryObject, function(tabs)
		{
			var txt = '';
			for (var i = 0; i < tabs.length; i++)
			{
				txt += tabs[i].url;
				if (i != tabs.length - 1)
				{
					if (tabs[i].windowId != tabs[i + 1].windowId)
					{
						txt += "\n\n";
					}
					else
					{
						txt += '\n';
					}
				}
			}
			navigator.clipboard.writeText(txt);
			updateStatus(tabs.length == 1 ? 'Copied 1 URL!' : ('Copied ' + tabs.length + ' URLs!'));
		});
}

function getTabQueryObj() {
	var queryObj = {};
	var allWindows = document.getElementById('chkMultiWindow').checked;
	if (!allWindows)
	{
		queryObj.windowId = chrome.windows.WINDOW_ID_CURRENT;
	}
	return queryObj;
}

function updateStatus(str) {
	var status = document.getElementById('txtStatus');
	status.innerHTML = str;
	status.style.display = 'block';
}

function getClipboardText() {
	var t = document.createElement("textarea");
	document.body.appendChild(t);
	t.focus();
	document.execCommand("paste");
	var clipTxt = t.value;
	document.body.removeChild(t);
	return clipTxt;
}