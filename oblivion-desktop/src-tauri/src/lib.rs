use serde::Serialize;
use std::process::Command;

// ── Types ──

#[derive(Debug, Serialize)]
pub struct ActiveWindow {
    pub app_name: String,
    pub window_title: String,
}

#[derive(Debug, Serialize)]
pub struct GitContext {
    pub is_git_repo: bool,
    pub branch: String,
    pub status: String,
    pub repo_root: String,
}

// ── Commands ──

/// Get the currently focused application window.
/// Uses AppleScript on macOS, xdotool on Linux, powershell on Windows.
#[tauri::command]
fn get_active_window() -> Result<ActiveWindow, String> {
    #[cfg(target_os = "macos")]
    {
        get_active_window_macos()
    }

    #[cfg(target_os = "linux")]
    {
        get_active_window_linux()
    }

    #[cfg(target_os = "windows")]
    {
        get_active_window_windows()
    }

    #[cfg(not(any(target_os = "macos", target_os = "linux", target_os = "windows")))]
    {
        Ok(ActiveWindow {
            app_name: "Unknown".to_string(),
            window_title: "Unknown".to_string(),
        })
    }
}

#[cfg(target_os = "macos")]
fn get_active_window_macos() -> Result<ActiveWindow, String> {
    // Get the frontmost application name
    let app_output = Command::new("osascript")
        .args(["-e", r#"tell application "System Events" to get name of first process whose frontmost is true"#])
        .output()
        .map_err(|e| format!("Failed to get active app: {}", e))?;

    let app_name = String::from_utf8_lossy(&app_output.stdout)
        .trim()
        .to_string();

    // Get the window title of the frontmost application
    let title_script = format!(
        r#"tell application "System Events" to tell process "{}" to get name of front window"#,
        app_name.replace('"', r#"\""#)
    );
    let title_output = Command::new("osascript")
        .args(["-e", &title_script])
        .output()
        .map_err(|e| format!("Failed to get window title: {}", e))?;

    let window_title = if title_output.status.success() {
        String::from_utf8_lossy(&title_output.stdout)
            .trim()
            .to_string()
    } else {
        String::new()
    };

    Ok(ActiveWindow {
        app_name,
        window_title,
    })
}

#[cfg(target_os = "linux")]
fn get_active_window_linux() -> Result<ActiveWindow, String> {
    // Use xdotool to get the active window
    let id_output = Command::new("xdotool")
        .args(["getactivewindow"])
        .output()
        .map_err(|e| format!("xdotool not found: {}", e))?;

    let window_id = String::from_utf8_lossy(&id_output.stdout)
        .trim()
        .to_string();

    let name_output = Command::new("xdotool")
        .args(["getactivewindow", "getwindowclassname"])
        .output()
        .map_err(|e| format!("Failed to get window class: {}", e))?;

    let app_name = String::from_utf8_lossy(&name_output.stdout)
        .trim()
        .to_string();

    let title_output = Command::new("xdotool")
        .args(["getactivewindow", "getwindowname"])
        .output()
        .map_err(|e| format!("Failed to get window name: {}", e))?;

    let window_title = String::from_utf8_lossy(&title_output.stdout)
        .trim()
        .to_string();

    Ok(ActiveWindow {
        app_name,
        window_title,
    })
}

#[cfg(target_os = "windows")]
fn get_active_window_windows() -> Result<ActiveWindow, String> {
    let output = Command::new("powershell")
        .args([
            "-Command",
            r#"
            Add-Type @"
            using System;
            using System.Runtime.InteropServices;
            using System.Text;
            public class WinApi {
                [DllImport("user32.dll")] public static extern IntPtr GetForegroundWindow();
                [DllImport("user32.dll")] public static extern int GetWindowText(IntPtr hWnd, StringBuilder lpString, int nMaxCount);
                [DllImport("user32.dll")] public static extern uint GetWindowThreadProcessId(IntPtr hWnd, out uint lpdwProcessId);
            }
"@
            $hwnd = [WinApi]::GetForegroundWindow()
            $sb = New-Object System.Text.StringBuilder 256
            [WinApi]::GetWindowText($hwnd, $sb, 256) | Out-Null
            $title = $sb.ToString()
            $pid = 0
            [WinApi]::GetWindowThreadProcessId($hwnd, [ref]$pid) | Out-Null
            $proc = Get-Process -Id $pid -ErrorAction SilentlyContinue
            $name = if ($proc) { $proc.ProcessName } else { "Unknown" }
            Write-Output "$name|||$title"
            "#,
        ])
        .output()
        .map_err(|e| format!("Failed to get active window: {}", e))?;

    let raw = String::from_utf8_lossy(&output.stdout).trim().to_string();
    let parts: Vec<&str> = raw.splitn(2, "|||").collect();

    Ok(ActiveWindow {
        app_name: parts.first().unwrap_or(&"Unknown").to_string(),
        window_title: parts.get(1).unwrap_or(&"").to_string(),
    })
}

/// Get Git context for a given directory path.
/// Returns branch, status, and repo root. Gracefully handles non-git dirs.
#[tauri::command]
fn get_git_context(path: String) -> Result<GitContext, String> {
    let path = if path.is_empty() {
        // Default to home directory
        std::env::var("HOME")
            .or_else(|_| std::env::var("USERPROFILE"))
            .unwrap_or_else(|_| ".".to_string())
    } else {
        path
    };

    // Check if it's a git repo
    let rev_parse = Command::new("git")
        .args(["rev-parse", "--is-inside-work-tree"])
        .current_dir(&path)
        .output();

    match rev_parse {
        Ok(output) if output.status.success() => {}
        _ => {
            return Ok(GitContext {
                is_git_repo: false,
                branch: String::new(),
                status: String::new(),
                repo_root: String::new(),
            });
        }
    }

    // Get repo root
    let root_output = Command::new("git")
        .args(["rev-parse", "--show-toplevel"])
        .current_dir(&path)
        .output()
        .map_err(|e| format!("git error: {}", e))?;

    let repo_root = String::from_utf8_lossy(&root_output.stdout)
        .trim()
        .to_string();

    // Get current branch
    let branch_output = Command::new("git")
        .args(["branch", "--show-current"])
        .current_dir(&path)
        .output()
        .map_err(|e| format!("git branch error: {}", e))?;

    let branch = String::from_utf8_lossy(&branch_output.stdout)
        .trim()
        .to_string();

    // Get short status
    let status_output = Command::new("git")
        .args(["status", "-s"])
        .current_dir(&path)
        .output()
        .map_err(|e| format!("git status error: {}", e))?;

    let status_raw = String::from_utf8_lossy(&status_output.stdout)
        .trim()
        .to_string();

    // Summarize status (count modified/added/deleted)
    let status = if status_raw.is_empty() {
        "clean".to_string()
    } else {
        let lines: Vec<&str> = status_raw.lines().collect();
        let modified = lines.iter().filter(|l| l.starts_with(" M") || l.starts_with("M ")).count();
        let added = lines.iter().filter(|l| l.starts_with("A ") || l.starts_with("??")).count();
        let deleted = lines.iter().filter(|l| l.starts_with(" D") || l.starts_with("D ")).count();
        format!("{}M {}A {}D", modified, added, deleted)
    };

    Ok(GitContext {
        is_git_repo: true,
        branch,
        status,
        repo_root,
    })
}

// ── App Entry ──

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .invoke_handler(tauri::generate_handler![
            get_active_window,
            get_git_context
        ])
        .run(tauri::generate_context!())
        .expect("error while running Oblivion AI");
}
