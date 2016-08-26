NAME := a
TEMP_PKG := _tmp
EXCLUDE_DIR := boom .git
KEY := private.pem
FILELIST := .gitignore
TEMP_TAR := temp.tar.xz
OUTPUT_TAR := omake.tar.xz.enc
METHOD := aes-256-cbc
BACKUP_TAR := backup.tar.xz

CP := cp -a
TAR := tar -cJvf 
RM := rm -rf

all: crx

.PHONY: backup clean crx sensitive reveal

clean:
	$(RM) *.crx *.tar.xz $(TEMP_PKG)

backup: clean
	$(TAR) ../../$(BACKUP_TAR) ../

crx:
	mkdir $(TEMP_PKG)
	$(CP) $(filter-out $(addprefix ../,$(EXCLUDE_DIR)),$(wildcard ../*)) $(TEMP_PKG)
	google-chrome --pack-extension=$(TEMP_PKG) --pack-extension-key=$(KEY)
	mv $(TEMP_PKG).crx $(NAME).crx
	$(RM) $(TEMP_PKG)

sensitive:
	$(TAR) $(TEMP_TAR) -T $(FILELIST)
	openssl $(METHOD) -a -salt -in $(TEMP_TAR) -out $(OUTPUT_TAR)
	$(RM) $(TEMP_TAR)

reveal:
	openssl $(METHOD) -d -a -in $(OUTPUT_TAR) -out $(TEMP_TAR)

