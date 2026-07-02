with open('android/build.gradle', 'r') as f:
    content = f.read()
new_repo = """
        maven {
            url("$rootDir/../node_modules/@react-native-async-storage/async-storage/android/local_repo")
        }
"""
content = content.replace("mavenCentral(); google()", "mavenCentral(); google();" + new_repo)
with open('android/build.gradle', 'w') as f:
    f.write(content)
