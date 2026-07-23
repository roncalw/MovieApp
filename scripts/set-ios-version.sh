#!/usr/bin/env zsh

# Enable strict shell error handling for every command that follows.
# -e: Exit immediately when any command returns an error status.
# -u: Exit when the script tries to use a variable that has not been defined.
# -o pipefail: Treat a multi-command pipeline as failed when any command in the
# pipeline fails, instead of checking only the pipeline's final command.
# Together these options prevent the script from continuing after an incomplete
# or unreliable edit.
set -euo pipefail

# Updates the four iOS marketing-version entries and the four iOS build-number
# entries stored in MovieApp's Xcode project file.
#
# Usage:
#   scripts/set-ios-version.sh <version> <build-number>
#
# Example:
#   scripts/set-ios-version.sh 3.4.1 6

# In shell scripts, $# is the number of arguments supplied by the user. The
# [[ ... ]] construct evaluates a condition, and -ne means "numerically not
# equal to." Therefore, this condition is true unless exactly two arguments
# were supplied: the version and the build number.
# If the count is wrong, print the required command format and stop before the
# Xcode project file can be changed.
if [[ $# -ne 2 ]]; then
  # Explain the required command format when either argument is missing.
  # >&2 sends this message to the standard error stream so callers can
  # distinguish an error from the script's normal output.
  echo "Usage: scripts/set-ios-version.sh <version> <build-number>" >&2

  # Stop before reading or changing the Xcode project file.
  exit 1
fi

# $1 is the first positional argument. Store it as the user-visible App Store
# version; the quotes preserve the argument as one value.
MARKETING_VERSION="$1"

# $2 is the second positional argument. Store it as the App Store build number;
# the quotes preserve the argument as one value.
BUILD_NUMBER="$2"

# =~ asks [[ ... ]] to compare the value on its left with the regular expression
# on its right, while ! reverses the result so this branch handles invalid
# values.
#
# The ^ and $ characters are anchors: they identify positions rather than
# matching visible characters. ^ says the first match must begin at the start of
# the value, and $ says the final match must end at the end of the value. Used
# together, they leave no room for unmatched text before or after the version.
# For example, [0-9]+\.[0-9]+\.[0-9]+ could find the matching substring 3.4.2
# inside "version-3.4.2-old". Adding ^ and $ rejects that larger value because
# its first character is not the first required digit and its last character is
# not the final required digit. Unlike quotation marks, the anchors do not wrap
# text into a string; the surrounding single quotes perform the separate shell
# task of preserving the regular-expression characters from shell expansion.
#
# [0-9] matches one digit because the brackets choose one character from the
# listed range, 0 through 9. It matches "4", for example, but not all of "42"
# because "42" contains two characters.
#
# Placing + after [0-9] changes the rule from "match one digit" to "match one or
# more digits in a row." Therefore, [0-9]+ matches "4", "42", and "007". It
# does not match an empty value because + requires at least one digit, and it
# does not match "4a" completely because "a" is not a digit.
#
# Brackets choose characters; they do not express a range of whole numbers.
# Consequently, [4-32] does not mean "match any number from 4 through 32."
# Regex interprets its first hyphen as the character range 4 through 3, which is
# invalid because that range runs backwards. Matching whole numbers from 4
# through 32 would require separate alternatives for 4-9, 10-29, and 30-32.
#
# Finally, \. matches an actual period. An unescaped period means "any one
# character," so [0-9]+.[0-9]+ would match both "3.4" and "3x4". Escaping it as
# [0-9]+\.[0-9]+ allows "3.4" but rejects "3x4" because a real period is
# required between the two groups of digits.
#
# The complete expression therefore accepts exactly three dot-separated numeric
# parts, such as 3.4.2.
# If the value is invalid, print the required format and stop before changing
# the Xcode project file.
if [[ ! "$MARKETING_VERSION" =~ '^[0-9]+\.[0-9]+\.[0-9]+$' ]]; then
  # Tell the user what a valid marketing version looks like.
  echo "Error: Version must contain three numeric parts, such as 3.4.2." >&2

  # Stop before reading or changing the Xcode project file.
  exit 1
fi

# A later grep command places the validated version inside another regular
# expression. In regex syntax, an ordinary period means "any one character," so
# the periods must be escaped there to continue meaning actual periods. This zsh
# replacement changes every . into \.. For example:
#
#   MARKETING_VERSION       -> 3.4.2
#   MARKETING_VERSION_REGEX -> 3\.4\.2
#
# Keep the user's original value for writing to the project, and store this
# escaped copy only for the later verification pattern.
MARKETING_VERSION_REGEX="${MARKETING_VERSION//./\\.}"

# Validate that the build number is a positive whole number. As above, =~ tests
# a regular expression and ! handles values that do not match. ^ and $ require
# the entire value to match; [1-9] requires a nonzero first digit, and [0-9]*
# permits zero or more additional digits. This rejects zero, signs, decimals,
# and other non-numeric characters.
# If the value is invalid, print an example and stop before changing the file.
if [[ ! "$BUILD_NUMBER" =~ '^[1-9][0-9]*$' ]]; then
  # Tell the user what a valid build number looks like.
  echo "Error: Build number must be a positive whole number, such as 6." >&2

  # Stop before reading or changing the Xcode project file.
  exit 1
fi

# Find the repository root from the script file's location instead of from the
# directory where the user happens to run the command. In zsh, $0 identifies
# the script being executed. Its value may be a shorter, relative path such as:
#
#   $0      -> scripts/set-ios-version.sh
#
# Adding :A asks zsh to turn that into the complete path beginning at the file
# system's root directory, represented by the first /. For example:
#
#   ${0:A}  -> /Users/me/MovieApp/scripts/set-ios-version.sh
#
# :A also handles a symbolic link, which is a file-system shortcut that points
# to a file stored somewhere else. If the user runs the script through such a
# shortcut, :A follows it and returns the real script file's complete path. This
# ensures the project root is calculated from the actual script location rather
# than from the shortcut's location.
#
# The :h modifier removes the final path component, similar to dirname. The
# first :h removes set-ios-version.sh and produces the scripts directory. The
# second :h removes scripts and produces the MovieApp repository root:
#
#   ${0:A:h}   -> /Users/me/MovieApp/scripts
#   ${0:A:h:h} -> /Users/me/MovieApp
#
# This calculation does not depend on the current working directory, run cd, or
# change the script's working directory. Quotes preserve the result as one value
# if any directory name contains spaces.
APP_ROOT="${0:A:h:h}"

# Build the absolute path to the file that stores Xcode's build settings.
PROJECT_FILE="$APP_ROOT/ios/MovieApp.xcodeproj/project.pbxproj"

# Within [[ ... ]], -f is true only when the path is an existing regular file;
# ! reverses that test. If the expected Xcode project file is missing, print the
# exact path and stop because there is no project file to update.
if [[ ! -f "$PROJECT_FILE" ]]; then
  # Report the exact missing path so a moved or renamed project is obvious.
  echo "Error: Xcode project file not found at $PROJECT_FILE" >&2

  # Stop because there is no project file that can be updated safely.
  exit 1
fi

# Count the MARKETING_VERSION assignment lines in the Xcode project file. Read
# the command from the grep call outward:
#
# - grep searches the file named by "$PROJECT_FILE". The double quotes expand
#   the variable to its stored path while keeping a path with spaces together.
# - The combined options -Ec mean -E and -c. -E enables the regular-expression
#   pattern described below, and -c prints a count instead of the matching lines.
# - The single-quoted text is the pattern grep searches for. Its pieces are:
#
#     ^                  the line must begin here; no earlier text is allowed
#     [[:space:]]*       allow zero or more indentation characters
#     MARKETING_VERSION  match this exact setting name
#     [[:space:]]*       allow zero or more spaces after the setting name
#     =                  match the equals sign that begins the assignment
#
#   It matches both "MARKETING_VERSION=3.4.2;" and an indented version such as
#   "    MARKETING_VERSION = 3.4.2;". It stops describing the line at = because
#   this step only needs to identify and count the assignment, not validate the
#   value after it. The single quotes protect ^, *, and the other regex syntax
#   from shell interpretation so grep receives the pattern exactly as written.
#
# At run time, suppose PROJECT_FILE contains this path:
#
#   /Users/me/MovieApp/ios/MovieApp.xcodeproj/project.pbxproj
#
# After "$PROJECT_FILE" is expanded, the important command being run is:
#
#   grep -Ec '^[[:space:]]*MARKETING_VERSION[[:space:]]*=' \
#     '/Users/me/MovieApp/ios/MovieApp.xcodeproj/project.pbxproj'
#
# The backslash at the end of the first displayed line means "continue this same
# command on the next line." It is only used to make a long command easier to
# read. The shell treats the two displayed lines exactly like this single line:
#
#   grep -Ec '^[[:space:]]*MARKETING_VERSION[[:space:]]*=' '/Users/me/MovieApp/ios/MovieApp.xcodeproj/project.pbxproj'
#
# The final quoted path tells grep which file to search. For example, suppose
# that file contains these four lines:
#
#   MARKETING_VERSION = 3.4.2;
#       MARKETING_VERSION=3.4.2;
#   CURRENT_PROJECT_VERSION = 6;
#   OTHER_MARKETING_VERSION = 3.4.2;
#
# The first line matches because it begins with MARKETING_VERSION followed by
# optional spaces and =. The second also matches because indentation and spaces
# are optional. The third does not contain the requested setting name. The
# fourth does not match because ^ requires MARKETING_VERSION itself to appear at
# the beginning of the line, apart from optional indentation. For this example,
# grep -c prints 2 because exactly two lines match.
#
# If that file has four matching assignment lines, grep prints this number:
#
#   4
#
# grep also reports success, so || true does not run. The { ...; } braces keep
# grep and that fallback together. $(...) captures the printed 4 and substitutes
# it into the assignment. The shell therefore finishes this statement as though
# it had executed this much simpler assignment:
#
#   MARKETING_VERSION_COUNT="4"
#
# If no lines match, grep prints 0 but reports a nonzero exit status. In that
# case, || runs true to prevent set -e from stopping the script. true prints
# nothing, so $(...) still captures grep's 0 and the variable becomes "0".
MARKETING_VERSION_COUNT="$({ grep -Ec '^[[:space:]]*MARKETING_VERSION[[:space:]]*=' "$PROJECT_FILE" || true; })"

# Count CURRENT_PROJECT_VERSION assignments with the same steps. The only
# pattern difference is the exact setting name: ^ requires the line to start,
# the first [[:space:]]* allows indentation, CURRENT_PROJECT_VERSION matches the
# literal name, the second [[:space:]]* allows spacing before =, and = marks the
# assignment. grep searches "$PROJECT_FILE" and prints the count; || true allows
# a zero-match result; and $(...) captures the printed number in
# BUILD_NUMBER_COUNT.
BUILD_NUMBER_COUNT="$({ grep -Ec '^[[:space:]]*CURRENT_PROJECT_VERSION[[:space:]]*=' "$PROJECT_FILE" || true; })"

# Require the four expected marketing-version locations before editing. -ne is
# a numeric "not equal" comparison, so this branch runs when the count is not
# four and stops before any replacement command runs.
if [[ "$MARKETING_VERSION_COUNT" -ne 4 ]]; then
  # Report the unexpected count and confirm that no edit has started.
  echo "Error: Expected 4 MARKETING_VERSION entries but found $MARKETING_VERSION_COUNT. No changes made." >&2

  # Stop because replacing an unexpected number of settings could be unsafe.
  exit 1
fi

# Require the four expected build-number locations before editing. As above,
# -ne compares numbers and enters this branch when the count is not four.
if [[ "$BUILD_NUMBER_COUNT" -ne 4 ]]; then
  # Report the unexpected count and confirm that no edit has started.
  echo "Error: Expected 4 CURRENT_PROJECT_VERSION entries but found $BUILD_NUMBER_COUNT. No changes made." >&2

  # Stop because replacing an unexpected number of settings could be unsafe.
  exit 1
fi

# Before editing the Xcode project, make a separate copy of its original
# contents. If a later command changes only some of the eight settings and then
# fails, the script can copy these unchanged contents back over the incomplete
# edit. That act of putting the original contents back is called restoration.
#
# The operating system provides TMPDIR as the preferred directory for short-lived
# files. On macOS, its value commonly resembles this:
#
#   /var/folders/ab/random-characters/T/
#
# ${TMPDIR:-/tmp} means "use TMPDIR when it contains a value; otherwise use the
# standard /tmp directory." The text movieapp-project.XXXXXX is a naming
# template. mktemp replaces XXXXXX with random characters, creates an empty file
# with that unique name, and prints its complete path. For example:
#
#   /var/folders/ab/random-characters/T/movieapp-project.K7p2Qa
#
# $(...) captures that printed path, and BACKUP_FILE stores it so the following
# commands know where the temporary copy is located.
BACKUP_FILE="$(mktemp "${TMPDIR:-/tmp}/movieapp-project.XXXXXX")"

# The temporary file is currently empty. Copy the entire, unchanged Xcode
# project file into it. BACKUP_FILE is now a safety copy of PROJECT_FILE as it
# existed before any version-setting edits began.
cp "$PROJECT_FILE" "$BACKUP_FILE"

# Record that no version edits have been checked yet. A value of 0 means "the
# script has not proved that all eight requested changes succeeded." This is set
# before editing because the script must assume an edit is unsafe until the
# later verification counts all four versions and all four build numbers.
VERSION_EDITS_VERIFIED=0

# Define a function named cleanup. Defining it only records these instructions;
# it does not run them now. A later trap command arranges for cleanup to run when
# the script finishes.
cleanup() {
  # Check the state recorded in VERSION_EDITS_VERIFIED. -eq means "numerically
  # equal." If its value is still 0, the script ended without proving that every
  # requested edit succeeded. This could happen after the upcoming sed commands
  # started changing the project file but before verification finished.
  if [[ "$VERSION_EDITS_VERIFIED" -eq 0 ]]; then
    # Replace the possibly incomplete project file with the unchanged copy made
    # above. If no edit happened before the failure, this simply copies identical
    # contents and causes no project change.
    cp "$BACKUP_FILE" "$PROJECT_FILE"
  fi

  # At this point either the verified edit was kept or the original contents
  # were put back. Remove the temporary copy because it is no longer needed.
  # rm -f also treats an already-missing file as a successful cleanup.
  rm -f "$BACKUP_FILE"
}

# trap is a command built into zsh. It tells the shell, "when a particular event
# happens later, run this command before finishing." Its general form here is:
#
#   trap command-to-run event-to-watch-for
#
# In the statement below, cleanup is the command to run. It refers to the
# cleanup() function defined above; it does not execute that function at the
# moment trap is read. EXIT is the event to watch for. zsh remembers this rule
# for the remainder of the script:
#
#   when this script is about to exit -> run cleanup first
#
# "About to exit" includes reaching the end normally, an explicit exit 1, or an
# error that ends the script because set -e is active. The two important paths
# through this script are therefore:
#
# 1. All edits pass verification. VERSION_EDITS_VERIFIED becomes 1. At normal
#    exit, cleanup sees 1, keeps the edited project, and deletes BACKUP_FILE.
# 2. An editing or verification step fails. VERSION_EDITS_VERIFIED remains 0.
#    Before the error exit completes, cleanup sees 0, copies BACKUP_FILE over the
#    incomplete project edit, and then deletes BACKUP_FILE.
#
# Register the rule immediately before the first editing command so every edit
# attempted after this point has that cleanup behavior. Like most software
# cleanup handlers, it cannot run if the process is forcibly terminated in a way
# that gives zsh no opportunity to exit, such as SIGKILL or sudden power loss.
trap cleanup EXIT

# Change each MARKETING_VERSION assignment in the actual Xcode project file.
# For example, if MARKETING_VERSION contains 3.4.2, this command changes:
#
#       MARKETING_VERSION = 3.3.0;
#
# into:
#
#       MARKETING_VERSION = 3.4.2;
#
# sed is a text-replacement program. -E enables the regex syntax used here. -i
# means edit PROJECT_FILE itself instead of merely printing changed text. The
# empty '' after -i tells macOS sed not to create another backup because this
# script already made BACKUP_FILE.
#
# sed accepts different operation letters. The letter s means "substitute," or
# replace matching text. It is an instruction to sed and is not part of the
# regular expression. The three / characters divide the instruction into parts:
#
#   s / pattern / replacement /
#   |   |         |
#   |   |         +-- text that sed will put into the file
#   |   +------------ regex describing the existing text to find
#   +---------------- substitution operation
#
# In the actual command, the first / is the one immediately after s, so the
# regular-expression pattern begins with ^. The second / appears after the old
# assignment's semicolon and ends the pattern. Everything between the second and
# third / is the replacement text. Written in a shortened form, the instruction
# has this shape:
#
#   s/^old version assignment;/new version assignment;/
#
# There is no g after the final /. Without a g, sed replaces the first match on
# each line. That is sufficient here because each Xcode setting occupies its own
# line and the pattern begins with ^, so it can match only one assignment on that
# line. Within the full pattern:
#
#   ^                 requires the match to start at the beginning of a line
#   ([[:space:]]*)    matches and remembers the line's existing indentation
#   MARKETING_VERSION matches that exact setting name
#   [[:space:]]*      permits optional spacing around the equals sign
#   =                 matches the equals sign
#   [^;]+             matches the old value up to, but not including, semicolon
#   ;                 matches the semicolon that ends the assignment
#
# The command must change the setting without removing the spaces or tabs at the
# beginning of its line. Suppose the original line begins with four spaces:
#
#   "    MARKETING_VERSION = 3.3.0;"
#    ^^^^ these four spaces are the indentation
#
# ([[:space:]]*) finds those four spaces. The surrounding parentheses tell sed
# to save the exact text it found. Later, \1 tells sed to paste that saved text
# at the start of the new line:
#
#   \1MARKETING_VERSION = 3.4.2;
#   ^^ paste the saved four spaces here
#
# The result still begins with four spaces:
#
#   "    MARKETING_VERSION = 3.4.2;"
#
# The 1 in \1 means "use the text saved by the first pair of parentheses." This
# command has only one pair, so \1 refers to the indentation.
#
# The script text contains \\1 because the sed instruction is inside double
# quotes: the shell changes \\ into one \ before passing the instruction to sed.
# ${MARKETING_VERSION} is also inside those double quotes, so zsh replaces it
# with the version supplied by the user. The backslashes at the ends of the first
# two command lines serve a different purpose: they continue one sed command
# across three physical lines.
sed -E -i '' \
  "s/^([[:space:]]*)MARKETING_VERSION[[:space:]]*=[[:space:]]*[^;]+;/\\1MARKETING_VERSION = ${MARKETING_VERSION};/" \
  "$PROJECT_FILE"

# Change each CURRENT_PROJECT_VERSION assignment in the same way. For example,
# when BUILD_NUMBER contains 6, this changes:
#
#       CURRENT_PROJECT_VERSION = 5;
#
# into:
#
#       CURRENT_PROJECT_VERSION = 6;
#
# The pattern finds the setting and its old value. \1 preserves the indentation,
# and ${BUILD_NUMBER} supplies the user's validated build number.
sed -E -i '' \
  "s/^([[:space:]]*)CURRENT_PROJECT_VERSION[[:space:]]*=[[:space:]]*[^;]+;/\\1CURRENT_PROJECT_VERSION = ${BUILD_NUMBER};/" \
  "$PROJECT_FILE"

# Do not assume the first sed command worked merely because it finished. Search
# the edited file and count assignments containing the requested version. For a
# requested version of 3.4.2, MARKETING_VERSION_REGEX supplies escaped periods,
# and the expanded pattern looks like this:
#
#   ^[[:space:]]*MARKETING_VERSION[[:space:]]*=[[:space:]]*3\.4\.2;[[:space:]]*$
#
# The final [[:space:]]*$ permits trailing whitespace and then requires the line
# to end, preventing extra text after the assignment from being accepted. grep
# -c prints the number of matching lines. $(...) captures that number in
# UPDATED_MARKETING_COUNT. The project is expected to contain four matches.
UPDATED_MARKETING_COUNT="$({ grep -Ec "^[[:space:]]*MARKETING_VERSION[[:space:]]*=[[:space:]]*${MARKETING_VERSION_REGEX};[[:space:]]*$" "$PROJECT_FILE" || true; })"

# Perform the corresponding check for the build number. For a requested build
# number of 6, grep searches for assignment lines beginning like this:
#
#   ^[[:space:]]*CURRENT_PROJECT_VERSION[[:space:]]*=[[:space:]]*6;[[:space:]]*$
#
# As above, $ requires the line to end after the assignment and any trailing
# whitespace. UPDATED_BUILD_COUNT stores how many lines matched. The expected
# count is also four.
UPDATED_BUILD_COUNT="$({ grep -Ec "^[[:space:]]*CURRENT_PROJECT_VERSION[[:space:]]*=[[:space:]]*${BUILD_NUMBER};[[:space:]]*$" "$PROJECT_FILE" || true; })"

# Decide whether it is safe to keep the edited project file. Each -ne means
# "numerically not equal," and || means "or." Therefore, this condition is true
# if the edited file does not contain exactly four requested versions or exactly
# four requested build numbers.
if [[ "$UPDATED_MARKETING_COUNT" -ne 4 || "$UPDATED_BUILD_COUNT" -ne 4 ]]; then
  # Report the failed check. exit 1 then ends the script with
  # VERSION_EDITS_VERIFIED still set to 0. The EXIT trap calls cleanup, which
  # replaces the incomplete edit with the original contents from BACKUP_FILE.
  echo "Error: Could not verify all 8 version settings. Original project file restored." >&2

  exit 1
fi

# Reaching this line proves that all eight requested assignments were found in
# the edited file. Change the state to 1, meaning "the edits were verified."
# When cleanup runs at normal exit, it will now skip copying the original
# contents back and will only delete BACKUP_FILE.
VERSION_EDITS_VERIFIED=1

# Confirm that all four version and four build-number entries were updated.
echo "Updated all 8 iOS version settings:"

# Display the marketing version that was written to the four configurations.
echo "  Version: $MARKETING_VERSION"

# Display the build number that was written to the four configurations.
echo "  Build:   $BUILD_NUMBER"
