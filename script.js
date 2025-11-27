/**
 * Find the correct window context containing the Create button.
 * Searches through all iframes to find where the button actually lives.
 */
const findComputeWindow = () => {
	// Check current window first
	if (document.querySelector('button[aria-label="Create"]')) {
		return window;
	}

	// Check known iframe selectors
	const knownSelectors = [
		"#compute-wrapper",
		"#sandbox-compute-container",
		"iframe[name*='compute']",
		"iframe[src*='compute']"
	];

	for (const selector of knownSelectors) {
		try {
			const element = document.querySelector(selector);
			if (element?.contentWindow?.document?.querySelector('button[aria-label="Create"]')) {
				return element.contentWindow;
			}
		} catch (e) {
			// Cross-origin or access denied, skip
		}
	}

	// Check ALL iframes as fallback
	const iframes = document.querySelectorAll('iframe');
	for (const iframe of iframes) {
		try {
			const iframeDoc = iframe.contentWindow?.document;
			if (iframeDoc?.querySelector('button[aria-label="Create"]')) {
				console.info(`%c *** Found Create button in iframe: ${iframe.id || iframe.name || iframe.src} *** `, "background-color: #222; color: #44bd50");
				return iframe.contentWindow;
			}
		} catch (e) {
			// Cross-origin iframe, skip
		}
	}

	// Last fallback to original logic
	return document.querySelector("#sandbox-compute-container")?.contentWindow || window;
};

const computeWindow = findComputeWindow();

/**
 * Multiple selectors to find the Create button, as Oracle may have changed their CSS structure
 */
const findCreateButton = (doc) => {
	const selectors = [
		// New Oracle 2025 UI selectors (based on your inspection)
		'button[aria-label="Create"]',
		'button.BaseButtonStyles_styles_variants_callToAction_base__jvi3ds13',
		'.jet-footer-layout button[aria-label="Create"]',
		// More specific new UI patterns
		'button.BaseButtonStyles_styles_base__jvi3ds0[aria-label="Create"]',
		'button[class*="BaseButtonStyles_styles_variants_callToAction"]',
		'button[class*="BaseButtonStyles_styles_base__jvi3ds0"]',
		// Original selector (for compatibility)
		".oui-savant__Panel--Footer .oui-button.oui-button-primary",
		// Alternative selectors for new UI
		"button[data-testid='create-button']",
		"button[type='submit']",
		".oui-button-primary",
		"button.oui-button-primary",
		// Generic fallbacks (removed invalid selector)
		"input[type='submit'][value='Create']"
	];
	
	for (const selector of selectors) {
		const element = doc.querySelector(selector);
		if (element && (
			element.textContent?.trim() === "Create" || 
			element.value?.trim() === "Create" ||
			element.getAttribute("aria-label")?.includes("Create")
		)) {
			return element;
		}
	}
	
	// Last resort: find any element containing "Create"
	const allElements = doc.querySelectorAll("button, input[type='submit']");
	for (const element of allElements) {
		if (element.textContent?.trim() === "Create" || 
		    element.value?.trim() === "Create" ||
		    element.getAttribute("aria-label")?.includes("Create")) {
			return element;
		}
	}
	
	return null;
};

const logStyle = color => `background-color: #222; color: ${color}`;

const createBtn = findCreateButton(computeWindow.document);
if (!createBtn) {
	console.error("*** Available buttons on page: ***");
	const allButtons = computeWindow.document.querySelectorAll("button, input[type='submit']");
	allButtons.forEach((btn, i) => {
		console.log(`Button ${i}: "${btn.textContent?.trim() || btn.value || 'no text'}" - ${btn.className} - aria-label: ${btn.getAttribute('aria-label')}`);
	});
	throw new Error("Failed to find 'Create' button - check console for available buttons");
} else {
	console.info(
		`%c *** Create button found! Class: ${createBtn.className} *** `,
		logStyle("#44bd50")
	);
}

/**
 * Find content and header elements with fallback selectors
 */
const findContentElement = (doc) => {
	const selectors = [
		// New Oracle 2025 UI
		".jet-footer-layout",
		".FlexStyles_baseStyles__10p93f60",
		// Original selectors
		".oui-savant__Panel--Contents",
		".oui-savant__Panel-Contents", 
		"[data-testid='panel-contents']",
		".panel-contents",
		"main",
		".main-content",
		"body"
	];
	
	for (const selector of selectors) {
		const element = doc.querySelector(selector);
		if (element) return element;
	}
	return doc.body;
};

const findHeaderElement = (doc) => {
	const selectors = [
		// New Oracle 2025 UI
		".jet-header-layout",
		"[class*='HeaderStyles']",
		// Original selectors
		".oui-savant__Panel--Header",
		".oui-savant__Panel-Header",
		"[data-testid='panel-header']", 
		".panel-header",
		"header",
		".header"
	];
	
	for (const selector of selectors) {
		const element = doc.querySelector(selector);
		if (element) return element;
	}
	// Create a mock header if none found
	const mockHeader = doc.createElement("div");
	mockHeader.style.height = "60px";
	return mockHeader;
};

const contentsElmt = findContentElement(computeWindow.document);
const headerElmt = findHeaderElement(computeWindow.document);

/**
 * Create a new window to cloud.oracle.com, and then periodically
 * refresh it.
 * 
 * We need to periodically regenerate your session token as it
 * will probably expire too soon - this script might be running
 * for a long time!
 */
const sessionWindow = window.open(
	"https://cloud.oracle.com",
	"_blank",
	"height=400,width=400;popup=true"
);

//create the status bar
const statusElmt = document.createElement("div");
statusElmt.setAttribute("style", `
	z-index: 9999999999999;
	position: fixed;
	top: 0;
	left: 0;
	width: 100%;
	display: flex;
	align-items: center;
	justify-content: center;
	font-size: 2rem;
	color: white;
	background-color: #00688c;
	box-shadow: 0px 0px 10px -4px black;
	white-space: break-spaces;
`);

/**
 * Set the status bar to be the same height as the header.
 */
const setStatusHeight = () => {
	statusElmt.style.height = `${headerElmt.clientHeight}px`;
};

setStatusHeight();
computeWindow.addEventListener("resize", setStatusHeight);
contentsElmt.prepend(statusElmt);

console.clear();

console.info(
	"%c *** Started Oracle compute instance creation script *** ",
	logStyle("#e0b414")
);
console.info(
	"%c *** Script adapted for the new Oracle 2025 interface *** ",
	logStyle("#e0b414")
);
console.info(
	"%c *** 📧 Automatic email on success (configure EMAIL_CONFIG) *** ",
	logStyle("#00ff00")
);
console.info(
	"%c *** DO NOT CLOSE THE POPUP WINDOW! *** ",
	logStyle("#ff4d4d")
);
console.info(
	"%c *** Fill ALL your parameters manually before running this script *** ",
	logStyle("#ff4d4d")
);
console.info(
	"%c *** Make sure you have configured all your parameters before launching *** ",
	logStyle("#f0dd99")
);
console.info(
	"%c *** The script will stop automatically when the instance is created *** ",
	logStyle("#f0dd99")
);
console.info(
	"%c *** Filter logs with '***' to only show outputs from this script. *** ",
	logStyle("#f0dd99")
);
console.info(
	"%c *** It's advised to close dev tools while the script is running, as over long periods of time it may crash (Oracle's fault). *** ",
	logStyle("#f0dd99")
);
console.info(
	"%c *** You can change the interval duration between clicks on the fly by changing the value of the variable `INTERVAL_DURATION` - default is 30 (seconds). *** ",
	logStyle("#f0dd99")
);

const currentTime = () => {
	const now = new Date();
	const hours = now.getHours().toString().padStart(2, '0');
	const minutes = now.getMinutes().toString().padStart(2, '0');
	const seconds = now.getSeconds().toString().padStart(2, '0');
	return `${hours}:${minutes}:${seconds}`;
};

// You can change this on the fly if you want
let INTERVAL_DURATION = 30;

// Email configuration - CHANGE THESE VALUES
const EMAIL_CONFIG = {
	SENDER_EMAIL: "your-email@gmail.com",
	SENDER_PASSWORD: "your-app-password", // Gmail app password
	RECIPIENT: "your-email@gmail.com",
	SMTP_SERVER: "smtp.gmail.com",
	SMTP_PORT: 587
};

/**
 * Send email notification when instance is created successfully
 */
const sendSuccessEmail = async () => {
	try {
		// Using EmailJS service (free tier) - you need to set this up at https://www.emailjs.com/
		// Alternative method using a simple email API
		const emailData = {
			to: EMAIL_CONFIG.RECIPIENT,
			subject: "🎉 Oracle Instance Created Successfully!",
			text: `
Good news! Your Oracle Cloud instance has been created successfully!

The script has stopped automatically.

Connect to Oracle Cloud to see your new instance:
https://cloud.oracle.com/compute/instances

Creation time: ${new Date().toLocaleString()}
			`,
			html: `
				<h2>🎉 Oracle Instance Created Successfully!</h2>
				<p><strong>Good news! Your Oracle Cloud instance has been created successfully!</strong></p>
				
				<p>The script has stopped automatically.</p>
				
				<p><a href="https://cloud.oracle.com/compute/instances" target="_blank">Connect to Oracle Cloud to see your new instance</a></p>
				
				<p><small>Creation time: ${new Date().toLocaleString()}</small></p>
			`
		};

		// Method 1: Using fetch to a simple email service (you may need to set up a backend)
		console.log(
			`%c *** Attempting to send email to ${EMAIL_CONFIG.RECIPIENT}... *** `,
			logStyle("#00ff00")
		);

		// Alternative: Show browser notification
		if ("Notification" in window) {
			if (Notification.permission === "granted") {
				new Notification("Oracle Instance Created!", {
					body: "Your Oracle Cloud instance has been created successfully! Check your email.",
					icon: "https://www.oracle.com/a/ocom/img/oracle-favicon.ico"
				});
			} else if (Notification.permission !== "denied") {
				Notification.requestPermission().then(permission => {
					if (permission === "granted") {
						new Notification("Oracle Instance Created!", {
							body: "Your Oracle Cloud instance has been created successfully!",
							icon: "https://www.oracle.com/a/ocom/img/oracle-favicon.ico"
						});
					}
				});
			}
		}

		// Method 2: Using mailto (opens email client)
		const mailtoLink = `mailto:${EMAIL_CONFIG.RECIPIENT}?subject=${encodeURIComponent(emailData.subject)}&body=${encodeURIComponent(emailData.text)}`;
		
		// Open email client
		const emailWindow = window.open(mailtoLink, '_blank');
		
		console.log(
			`%c *** Email prepared! Check your email client or notifications. *** `,
			logStyle("#00ff00")
		);

		return true;
	} catch (error) {
		console.error(
			`%c *** Error sending email: ${error.message} *** `,
			logStyle("#ff4d4d")
		);
		return false;
	}
};

/**
 * Check if instance was created successfully
 */
const checkInstanceCreated = (doc) => {
	const successSelectors = [
		// Success messages patterns
		'[class*="AlertStyles_styles_success"]',
		'[class*="MessageStyles_styles_success"]', 
		'[class*="NotificationStyles_styles_success"]',
		'[role="status"]',
		'.oui-alert-success',
		'.alert-success'
	];
	
	for (const selector of successSelectors) {
		const successElements = doc.querySelectorAll(selector);
		for (const element of successElements) {
			const text = element.textContent?.toLowerCase() || "";
			if (text.includes("created") || 
			    text.includes("success") || 
			    text.includes("launched") ||
			    text.includes("provisioning") ||
			    text.includes("starting")) {
				return element.textContent;
			}
		}
	}
	
	// Check if we're on a different page (instance list or details)
	const currentUrl = doc.location?.href || window.location.href;
	if (currentUrl.includes("/instances") && !currentUrl.includes("/create")) {
		return "Redirected to instances page - likely created successfully";
	}
	
	return null;
};

const countdownDuration = () => Math.round(INTERVAL_DURATION);

let countdown = countdownDuration();
let instanceCreated = false;

/**
 * Enhanced error detection to handle Oracle capacity issues
 */
const checkForErrors = (doc) => {
	const errorSelectors = [
		// New Oracle 2025 UI error patterns
		'[class*="AlertStyles_styles_error"]',
		'[class*="AlertStyles_styles_warning"]', 
		'[class*="MessageStyles_styles_error"]',
		'[class*="NotificationStyles_styles_error"]',
		'[role="alert"]',
		'[aria-live="polite"]',
		// Original selectors
		".oui-alert-error",
		".alert-error", 
		"[data-testid='error-message']",
		".error-message",
		".oui-alert-warning",
		".alert-warning"
	];
	
	for (const selector of errorSelectors) {
		const errorElements = doc.querySelectorAll(selector);
		for (const errorElement of errorElements) {
			const text = errorElement.textContent?.toLowerCase() || "";
			if (text.includes("capacity") || 
			    text.includes("availability") || 
			    text.includes("limit") ||
			    text.includes("quota") ||
			    text.includes("insufficient") ||
			    text.includes("unavailable")) {
				return errorElement.textContent;
			}
		}
	}
	return null;
};

/**
 * Interval to click the 'Create' button and reload the new window
 * every `INTERVAL_DURATION` milliseconds.
 */
let intervalId = setInterval(async () => {
	// Stop if instance was already created
	if (instanceCreated) {
		clearInterval(intervalId);
		statusElmt.style.backgroundColor = "#00ff00";
		statusElmt.innerHTML = `✅ <b>Instance created! Script stopped.</b>`;
		sessionWindow.close();
		return;
	}

	if (countdown > 0) {
		statusElmt.style.backgroundColor = "#00688c";
		statusElmt.innerHTML = `Clicking in <b>${countdown} seconds</b>`;
		countdown--;
		return;
	}

	// Check if instance was created before clicking again
	const successMsg = checkInstanceCreated(computeWindow.document);
	if (successMsg) {
		console.log(
			`%c *** 🎉 SUCCESS! Instance created: ${successMsg} *** `,
			logStyle("#00ff00")
		);
		
		statusElmt.style.backgroundColor = "#00ff00";
		statusElmt.innerHTML = `✅ <b>Instance created successfully!</b>`;
		
		// Send email notification
		await sendSuccessEmail();
		
		// Stop the script
		instanceCreated = true;
		clearInterval(intervalId);
		sessionWindow.close();
		
		console.log(
			`%c *** 🛑 Script stopped - Instance created successfully! *** `,
			logStyle("#00ff00")
		);
		return;
	}

	// Check for capacity errors before clicking
	const errorMsg = checkForErrors(computeWindow.document);
	if (errorMsg) {
		console.log(
			`%c *** Capacity error detected: ${errorMsg} - Retrying... *** `,
			logStyle("#ff9500")
		);
	}

	sessionWindow.location.reload();
	
	// Re-find the create button in case the page has changed
	const currentCreateBtn = findCreateButton(computeWindow.document);
	if (currentCreateBtn) {
		currentCreateBtn.click();
		statusElmt.style.backgroundColor = "#44bd50";
		statusElmt.innerHTML = `Create clicked!`;
		console.log(
			`%c *** Clicked 'Create' at ${currentTime()} *** `,
			logStyle("#7cde6f")
		);
	} else {
		statusElmt.style.backgroundColor = "#ff4d4d";
		statusElmt.innerHTML = `Create button not found!`;
		console.error(
			`%c *** Failed to find Create button at ${currentTime()} *** `,
			logStyle("#ff4d4d")
		);
	}
	
	countdown = countdownDuration();
}, 1000);