import { Request, Response } from 'express';
import { StorageController } from '../../src/app/routes/storage-v2';
import { Logger } from 'winston';
import sinon, { SinonStub } from 'sinon';
import { expect } from 'chai';

describe('Storage controller', () => {

  describe('Create file', () => {

    it('should fail if `fileId` is not given', async () => {
      // Arrange
      const loggerError = sinon.spy();
      const controller = getController({}, {
        error: loggerError
      });
      const request = getRequest({
        behalfUser: {
          email: ''
        },
        body: {
          file: {
            bucket: '--',
            size: '--',
            folder_id: '--',
            name: '--',
          }
        },
        headers: {
          'internxt-client': '',
        }
      });
      const jsonSpy = sinon.spy();
      const response = getResponse({
        status: () => {
          return {
            json: jsonSpy
          };
        }
      });

      // Act
      await controller.createFile(request, response);

      // Assert
      expect(loggerError.calledOnce).to.be.true;
      expect(jsonSpy.calledOnce).to.be.true;
    });

    it('should fail if `bucket` is not given', async () => {
      // Arrange
      const loggerError = sinon.spy();
      const controller = getController({}, {
        error: loggerError
      });
      const request = getRequest({
        behalfUser: {
          email: ''
        },
        body: {
          file: {
            fileId: '--',
            size: '--',
            folder_id: '--',
            name: '--',
          }
        },
        headers: {
          'internxt-client': '',
        }
      });
      const jsonSpy = sinon.spy();
      const response = getResponse({
        status: () => {
          return {
            json: jsonSpy
          };
        }
      });

      // Act
      await controller.createFile(request, response);

      // Assert
      expect(loggerError.calledOnce).to.be.true;
      expect(jsonSpy.calledOnce).to.be.true;
    });

    it('should fail if `size` is not given', async () => {
      // Arrange
      const loggerError = sinon.spy();
      const controller = getController({}, {
        error: loggerError
      });
      const request = getRequest({
        behalfUser: {
          email: ''
        },
        body: {
          file: {
            fileId: '--',
            bucket: '--',
            folder_id: '--',
            name: '--',
          }
        },
        headers: {
          'internxt-client': '',
        }
      });
      const jsonSpy = sinon.spy();
      const response = getResponse({
        status: () => {
          return {
            json: jsonSpy
          };
        }
      });

      // Act
      await controller.createFile(request, response);

      // Assert
      expect(loggerError.calledOnce).to.be.true;
      expect(jsonSpy.calledOnce).to.be.true;
    });

    it('should fail if `folder_id` is not given', async () => {
      // Arrange
      const loggerError = sinon.spy();
      const controller = getController({}, {
        error: loggerError
      });
      const request = getRequest({
        behalfUser: {
          email: ''
        },
        body: {
          file: {
            fileId: '--',
            bucket: '--',
            size: '--',
            name: '--',
          }
        },
        headers: {
          'internxt-client': '',
        }
      });
      const jsonSpy = sinon.spy();
      const response = getResponse({
        status: () => {
          return {
            json: jsonSpy
          };
        }
      });

      // Act
      await controller.createFile(request, response);

      // Assert
      expect(loggerError.calledOnce).to.be.true;
      expect(jsonSpy.calledOnce).to.be.true;
    });

    it('should fail if `name` is not given', async () => {
      // Arrange
      const loggerError = sinon.spy();
      const controller = getController({}, {
        error: loggerError
      });
      const request = getRequest({
        behalfUser: {
          email: ''
        },
        body: {
          file: {
            fileId: '--',
            bucket: '--',
            size: '--',
            folder_id: '--',
          }
        },
        headers: {
          'internxt-client': '',
        }
      });
      const jsonSpy = sinon.spy();
      const response = getResponse({
        status: () => {
          return {
            json: jsonSpy
          };
        }
      });

      // Act
      await controller.createFile(request, response);

      // Assert
      expect(loggerError.calledOnce).to.be.true;
      expect(jsonSpy.calledOnce).to.be.true;
    });

    it('should work fine if all params are given', async () => {
      // Arrange
      const services = {
        Files: {
          CreateFile: sinon.spy()
        },
        Analytics: {
          trackUploadCompleted: sinon.spy()
        },
        User: {
          findWorkspaceMembers: stubOf('findWorkspaceMembers')
            .resolves([{}, {}])
        },
        Notifications: {
          fileCreated: sinon.spy()
        }
      };
      const controller = getController(services);
      const request = getRequest({
        behalfUser: {
          email: ''
        },
        body: {
          file: {
            fileId: '1',
            bucket: '2',
            size: '3',
            folder_id: '4',
            name: '5',
          }
        },
        headers: {
          'internxt-client': '',
        }
      });
      const jsonSpy = sinon.spy();
      const response = getResponse({
        status: () => {
          return {
            json: jsonSpy
          };
        }
      });

      // Act
      await controller.createFile(request, response);

      // Assert
      expect(services.Files.CreateFile.calledOnce).to.be.true;
      expect(services.Analytics.trackUploadCompleted.calledOnce).to.be.true;
      expect(services.User.findWorkspaceMembers.calledOnce).to.be.true;
      expect(services.Notifications.fileCreated.calledTwice).to.be.true;
      expect(jsonSpy.calledOnce).to.be.true;
    });

    it('should work as fine if `file_id` is given instead of `fileId`', async () => {
      // Arrange
      const services = {
        Files: {
          CreateFile: sinon.spy()
        },
        Analytics: {
          trackUploadCompleted: sinon.spy()
        },
        User: {
          findWorkspaceMembers: stubOf('findWorkspaceMembers')
            .resolves([{}, {}])
        },
        Notifications: {
          fileCreated: sinon.spy()
        }
      };
      const controller = getController(services);
      const request = getRequest({
        behalfUser: {
          email: '',
          id: ''
        },
        body: {
          file: {
            file_id: '1',
            bucket: '2',
            size: '3',
            folder_id: '4',
            name: '5',
          }
        },
        headers: {
          'internxt-client': '',
        }
      });
      const jsonSpy = sinon.spy();
      const response = getResponse({
        status: () => {
          return {
            json: jsonSpy
          };
        }
      });

      // Act
      await controller.createFile(request, response);

      // Assert
      expect(services.Files.CreateFile.calledOnce).to.be.true;
      expect(services.Analytics.trackUploadCompleted.calledOnce).to.be.true;
      expect(services.User.findWorkspaceMembers.calledOnce).to.be.true;
      expect(services.Notifications.fileCreated.calledTwice).to.be.true;
      expect(jsonSpy.calledOnce).to.be.true;
    });

    it('should apply user referral if mobile client', async () => {
      // Arrange
      const services = {
        Files: {
          CreateFile: sinon.spy()
        },
        Analytics: {
          trackUploadCompleted: sinon.spy()
        },
        UsersReferrals: {
          applyUserReferral: stubOf('applyUserReferral')
            .resolves()
        },
        User: {
          findWorkspaceMembers: stubOf('findWorkspaceMembers')
            .resolves([{}, {}])
        },
        Notifications: {
          fileCreated: sinon.spy()
        }
      };
      const controller = getController(services);
      const request = getRequest({
        behalfUser: {
          email: 'email',
          id: 'id'
        },
        body: {
          file: {
            file_id: '1',
            bucket: '2',
            size: '3',
            folder_id: '4',
            name: '5',
          }
        },
        headers: {
          'internxt-client': 'drive-mobile',
        }
      });
      const jsonSpy = sinon.spy();
      const response = getResponse({
        status: () => {
          return {
            json: jsonSpy
          };
        }
      });

      // Act
      await controller.createFile(request, response);

      // Assert
      expect(services.Files.CreateFile.calledOnce).to.be.true;
      expect(services.Analytics.trackUploadCompleted.calledOnce).to.be.true;
      expect(services.User.findWorkspaceMembers.calledOnce).to.be.true;
      expect(services.Notifications.fileCreated.calledTwice).to.be.true;
      expect(jsonSpy.calledOnce).to.be.true;
      expect(services.UsersReferrals.applyUserReferral.calledOnce).to.be.true;
      expect(services.UsersReferrals.applyUserReferral.args[0]).to.deep.equal(['id', 'install-mobile-app']);
    });

    it('should apply user referral if desktop client', async () => {
      // Arrange
      const services = {
        Files: {
          CreateFile: sinon.spy()
        },
        Analytics: {
          trackUploadCompleted: sinon.spy()
        },
        UsersReferrals: {
          applyUserReferral: stubOf('applyUserReferral')
            .resolves()
        },
        User: {
          findWorkspaceMembers: stubOf('findWorkspaceMembers')
            .resolves([{}, {}])
        },
        Notifications: {
          fileCreated: sinon.spy()
        }
      };
      const controller = getController(services);
      const request = getRequest({
        behalfUser: {
          email: 'email',
          id: 'id'
        },
        body: {
          file: {
            file_id: '1',
            bucket: '2',
            size: '3',
            folder_id: '4',
            name: '5',
          }
        },
        headers: {
          'internxt-client': 'drive-desktop',
        }
      });
      const jsonSpy = sinon.spy();
      const response = getResponse({
        status: () => {
          return {
            json: jsonSpy
          };
        }
      });

      // Act
      await controller.createFile(request, response);

      // Assert
      expect(services.Files.CreateFile.calledOnce).to.be.true;
      expect(services.Analytics.trackUploadCompleted.calledOnce).to.be.true;
      expect(services.User.findWorkspaceMembers.calledOnce).to.be.true;
      expect(services.Notifications.fileCreated.calledTwice).to.be.true;
      expect(jsonSpy.calledOnce).to.be.true;
      expect(services.UsersReferrals.applyUserReferral.calledOnce).to.be.true;
      expect(services.UsersReferrals.applyUserReferral.args[0]).to.deep.equal(['id', 'install-desktop-app']);
    });


  });

  describe('Create folder', () => {

    it('should fail if folder name is not valid', async () => {
      // Arrange
      const controller = getController({});
      const request = getRequest({
        user: {
          email: ''
        },
        body: {
          folderName: '',
          parentFolderId: 10
        },
        headers: {}
      });
      const response = getResponse();

      try {
        // Act
        await controller.createFolder(request, response);
        expect(true).to.be.false;
      } catch ({ message }) {
        // Assert
        expect(message).to.equal('Folder name must be a valid string');
      }
    });

    it('should fail if parent folder ID is not valid', async () => {
      // Arrange
      const controller = getController({});
      const request = getRequest({
        user: {
          email: ''
        },
        body: {
          folderName: 'name',
          parentFolderId: 0
        },
        headers: {}
      });
      const response = getResponse();

      try {
        // Act
        await controller.createFolder(request, response);
        expect(true).to.be.false;
      } catch ({ message }) {
        // Assert
        expect(message).to.equal('Parent folder ID is not valid');
      }
    });

    it('should return error if creation fails', async () => {
      // Arrange
      const services = {
        Folder: {
          Create: stubOf('Create')
            .rejects({
              message: 'my-error'
            })
        }
      };
      const controller = getController(services);
      const request = getRequest({
        user: {
          email: ''
        },
        body: {
          folderName: 'name',
          parentFolderId: 10
        },
        headers: {}
      });
      const jsonSpy = sinon.spy();
      const response = getResponse({
        status: () => {
          return {
            json: jsonSpy
          };
        }
      });

      // Act
      await controller.createFolder(request, response);

      // Assert
      expect(services.Folder.Create.calledOnce).to.be.true;
      expect(jsonSpy.calledOnce).to.be.true;
      expect(jsonSpy.args[0]).to.deep.equal([{
        error: 'my-error'
      }]);
    });

    it('should execute successful complete creation when everything is fine', async () => {
      // Arrange
      const services = {
        Folder: {
          Create: stubOf('Create')
            .resolves({
              data: 'some'
            })
        },
        User: {
          findWorkspaceMembers: stubOf('findWorkspaceMembers')
            .resolves([{}, {}])
        },
        Notifications: {
          folderCreated: sinon.spy()
        }
      };
      const controller = getController(services);
      const request = getRequest({
        user: {
          email: ''
        },
        body: {
          folderName: 'name',
          parentFolderId: 10
        },
        headers: {}
      });
      const jsonSpy = sinon.spy();
      const response = getResponse({
        status: () => {
          return {
            json: jsonSpy
          };
        }
      });

      // Act
      await controller.createFolder(request, response);

      // Assert
      expect(services.Folder.Create.calledOnce).to.be.true;
      expect(services.User.findWorkspaceMembers.calledOnce).to.be.true;
      expect(services.Notifications.folderCreated.calledTwice).to.be.true;
      expect(jsonSpy.calledOnce).to.be.true;
      expect(jsonSpy.args[0]).to.deep.equal([{
        data: 'some'
      }]);
    });

  });

  describe('Generate folder tree', () => {

    it('should return error when execution fails', async () => {
      // Arrange
      const services = {
        Folder: {
          GetTree: stubOf('GetTree')
            .rejects({
              message: 'my-error'
            })
        },
      };
      const controller = getController(services);
      const finalParams = {
        user: {},
      };
      const request = getRequest(finalParams);
      const sendSpy = sinon.spy();
      const response = getResponse({
        status: () => {
          return {
            send: sendSpy
          };
        }
      });

      // Act
      await controller.getTree(request, response);

      // Assert
      expect(services.Folder.GetTree.calledOnce).to.be.true;
      expect(sendSpy.calledOnce).to.be.true;
      expect(sendSpy.args[0]).to.deep.equal([{
        error: 'my-error'
      }]);
    });

    it('should execute fine when no error', async () => {
      // Arrange
      const services = {
        Folder: {
          GetTree: stubOf('GetTree')
            .resolves({
              value: 'any'
            })
        },
      };
      const controller = getController(services);
      const finalParams = {
        user: {},
      };
      const request = getRequest(finalParams);
      const sendSpy = sinon.spy();
      const response = getResponse({
        status: () => {
          return {
            send: sendSpy
          };
        }
      });

      // Act
      await controller.getTree(request, response);

      // Assert
      expect(services.Folder.GetTree.calledOnce).to.be.true;
      expect(sendSpy.calledOnce).to.be.true;
      expect(sendSpy.args[0]).to.deep.equal([{
        value: 'any'
      }]);
    });

  });

  describe('Generate folder tree of a specific folder', () => {

    it('should fail if `folderId` is not valid', async () => {
      // Arrange
      const controller = getController();
      const finalParams = {
        user: {},
        params: {
          folderId: ''
        }
      };
      const request = getRequest(finalParams);
      const response = getResponse();

      try {

        // Act
        await controller.getTreeSpecific(request, response);
        expect(true).to.be.false;
      } catch ({ message }) {
        // Assert
        expect(message).to.equal('Folder ID not valid');
      }
    });

    it('should return error when execution fails', async () => {
      // Arrange
      const services = {
        Folder: {
          GetTree: stubOf('GetTree')
            .rejects({
              message: 'my-error'
            })
        },
      };
      const controller = getController(services);
      const finalParams = {
        user: {},
        params: {
          folderId: '1'
        }
      };
      const request = getRequest(finalParams);
      const sendSpy = sinon.spy();
      const response = getResponse({
        status: () => {
          return {
            send: sendSpy
          };
        }
      });

      // Act
      await controller.getTreeSpecific(request, response);

      // Assert
      expect(services.Folder.GetTree.calledOnce).to.be.true;
      expect(sendSpy.calledOnce).to.be.true;
      expect(sendSpy.args[0]).to.deep.equal([{
        error: 'my-error'
      }]);
    });

    it('should execute fine when no error', async () => {
      // Arrange
      const services = {
        Folder: {
          GetTree: stubOf('GetTree')
            .resolves({
              value: 'any'
            }),
          GetTreeSize: stubOf('GetTreeSize')
            .returns(999),
        },
      };
      const controller = getController(services);
      const finalParams = {
        user: {},
        params: {
          folderId: '1'
        }
      };
      const request = getRequest(finalParams);
      const sendSpy = sinon.spy();
      const response = getResponse({
        status: () => {
          return {
            send: sendSpy
          };
        }
      });

      // Act
      await controller.getTreeSpecific(request, response);

      // Assert
      expect(services.Folder.GetTree.calledOnce).to.be.true;
      expect(services.Folder.GetTree.args[0]).to.deep.equal([
        {}, '1'
      ]);
      expect(services.Folder.GetTreeSize.calledOnce).to.be.true;
      expect(sendSpy.calledOnce).to.be.true;
      expect(sendSpy.args[0]).to.deep.equal([{
        tree: {
          value: 'any'
        },
        size: 999
      }]);
    });

  });

  describe('Delete folder', () => {

    it('should fail if missing param `id`', async () => {
      // Arrange
      const controller = getController({});
      const request = getRequest({
        behalfUser: {},
        params: {
          id: ''
        },
      });
      const response = getResponse();

      try {
        // Act
        await controller.deleteFolder(request, response);
        expect(true).to.be.false;
      } catch ({ message }) {
        // Assert
        expect(message).to.equal('Folder ID param is not valid');
      }
    });

    it('should return error when execution fails', async () => {
      // Arrange
      const services = {
        Folder: {
          Delete: stubOf('Delete')
            .rejects({
              message: 'my-error'
            }),
        }
      };
      const controller = getController(services);
      const request = getRequest({
        behalfUser: {},
        params: {
          id: '1'
        },
        headers: {}
      });
      const sendSpy = sinon.spy();
      const response = getResponse({
        status: () => {
          return {
            send: sendSpy
          };
        }
      });

      // Act
      await controller.deleteFolder(request, response);

      // Assert
      expect(services.Folder.Delete.calledOnce).to.be.true;
      expect(sendSpy.calledOnce).to.be.true;
      expect(sendSpy.args[0]).to.deep.equal([{
        error: 'my-error'
      }]);
    });

    it('should execute fine when no error', async () => {
      // Arrange
      const services = {
        Folder: {
          Delete: stubOf('Delete')
            .resolves({
              some: 'data'
            }),
        },
        User: {
          findWorkspaceMembers: stubOf('findWorkspaceMembers')
            .resolves([
              {}, {}
            ]),
        },
        Notifications: {
          folderDeleted: sinon.spy()
        }
      };
      const controller = getController(services);
      const request = getRequest({
        behalfUser: {},
        params: {
          id: '1'
        },
        headers: {}
      });
      const sendSpy = sinon.spy();
      const response = getResponse({
        status: () => {
          return {
            send: sendSpy
          };
        }
      });

      // Act
      await controller.deleteFolder(request, response);

      // Assert
      expect(services.Folder.Delete.calledOnce).to.be.true;
      expect(services.User.findWorkspaceMembers.calledOnce).to.be.true;
      expect(services.Notifications.folderDeleted.calledTwice).to.be.true;
      expect(sendSpy.calledOnce).to.be.true;
      expect(sendSpy.args[0]).to.deep.equal([{
        some: 'data'
      }]);
    });

  });

  describe('Move folder', () => {

    it('should fail if missing param `folderId`', async () => {
      // Arrange
      const controller = getController({});
      const request = getRequest({
        behalfUser: {},
        body: {
          folderId: '',
          destination: '2'
        },
      });
      const response = getResponse();

      try {
        // Act
        await controller.moveFolder(request, response);
        expect(true).to.be.false;
      } catch ({ message }) {
        // Assert
        expect(message).to.equal('Folder ID is not valid');
      }
    });

    it('should fail if missing param `destination`', async () => {
      // Arrange
      const controller = getController({});
      const request = getRequest({
        behalfUser: {},
        body: {
          folderId: '2',
          destination: ''
        },
      });
      const response = getResponse();

      try {
        // Act
        await controller.moveFolder(request, response);
        expect(true).to.be.false;
      } catch ({ message }) {
        // Assert
        expect(message).to.equal('Destination folder ID is not valid');
      }
    });

    it('should return error when execution fails', async () => {
      // Arrange
      const services = {
        Folder: {
          MoveFolder: stubOf('MoveFolder')
            .rejects({
              message: 'my-error'
            }),
        }
      };
      const controller = getController(services);
      const request = getRequest({
        behalfUser: {},
        body: {
          folderId: '1',
          destination: '2'
        },
        headers: {}
      });
      const jsonSpy = sinon.spy();
      const response = getResponse({
        status: () => {
          return {
            json: jsonSpy
          };
        }
      });

      // Act
      await controller.moveFolder(request, response);

      // Assert
      expect(services.Folder.MoveFolder.calledOnce).to.be.true;
      expect(jsonSpy.calledOnce).to.be.true;
      expect(jsonSpy.args[0]).to.deep.equal([{
        error: 'my-error'
      }]);
    });

    it('should execute fine when no error', async () => {
      // Arrange
      const services = {
        Folder: {
          MoveFolder: stubOf('MoveFolder')
            .resolves({
              result: {
                some: 'data'
              },
              other: {
                some: 'more'
              }
            }),
        },
        User: {
          findWorkspaceMembers: stubOf('findWorkspaceMembers')
            .resolves([
              {}, {}
            ]),
        },
        Notifications: {
          folderUpdated: sinon.spy()
        }
      };
      const controller = getController(services);
      const request = getRequest({
        behalfUser: {},
        body: {
          folderId: '1',
          destination: '2'
        },
        headers: {}
      });
      const jsonSpy = sinon.spy();
      const response = getResponse({
        status: () => {
          return {
            json: jsonSpy
          };
        }
      });

      // Act
      await controller.moveFolder(request, response);

      // Assert
      expect(services.Folder.MoveFolder.calledOnce).to.be.true;
      expect(services.User.findWorkspaceMembers.calledOnce).to.be.true;
      expect(services.Notifications.folderUpdated.calledTwice).to.be.true;
      expect(jsonSpy.calledOnce).to.be.true;
      expect(jsonSpy.args[0]).to.deep.equal([{
        result: {
          some: 'data'
        },
        other: {
          some: 'more'
        }
      }]);
    });

  });

  describe('Update folder', () => {

    it('should fail if missing param `folderId`', async () => {
      // Arrange
      const controller = getController({});
      const request = getRequest({
        behalfUser: {},
        params: {
          folderid: ''
        },
        body: {
          metadata: {},
        },
      });
      const response = getResponse();

      try {
        // Act
        await controller.updateFolder(request, response);
        expect(true).to.be.false;
      } catch ({ message }) {
        // Assert
        expect(message).to.equal('Folder ID is not valid');
      }
    });

    it('should return error when execution fails', async () => {
      // Arrange
      const services = {
        Folder: {
          UpdateMetadata: stubOf('UpdateMetadata')
            .rejects({
              message: 'my-error'
            }),
        }
      };
      const controller = getController(services);
      const request = getRequest({
        behalfUser: {},
        params: {
          folderid: '2'
        },
        body: {
          metadata: {},
        },
        headers: {}
      });
      const jsonSpy = sinon.spy();
      const response = getResponse({
        status: () => {
          return {
            json: jsonSpy
          };
        }
      });

      // Act
      await controller.updateFolder(request, response);

      // Assert
      expect(services.Folder.UpdateMetadata.calledOnce).to.be.true;
      expect(jsonSpy.calledOnce).to.be.true;
      expect(jsonSpy.args[0]).to.deep.equal(['my-error']);
    });

    it('should execute fine when no error', async () => {
      // Arrange
      const services = {
        Folder: {
          UpdateMetadata: stubOf('UpdateMetadata')
            .resolves({
              result: {
                some: 'data'
              }
            }),
        },
        User: {
          findWorkspaceMembers: stubOf('findWorkspaceMembers')
            .resolves([
              {}, {}
            ]),
        },
        Notifications: {
          folderUpdated: sinon.spy()
        }
      };
      const controller = getController(services);
      const request = getRequest({
        behalfUser: {},
        params: {
          folderid: '2'
        },
        body: {
          metadata: {},
        },
        headers: {}
      });
      const jsonSpy = sinon.spy();
      const response = getResponse({
        status: () => {
          return {
            json: jsonSpy
          };
        }
      });

      // Act
      await controller.updateFolder(request, response);

      // Assert
      expect(services.Folder.UpdateMetadata.calledOnce).to.be.true;
      expect(services.User.findWorkspaceMembers.calledOnce).to.be.true;
      expect(services.Notifications.folderUpdated.calledTwice).to.be.true;
      expect(jsonSpy.calledOnce).to.be.true;
      expect(jsonSpy.args[0]).to.deep.equal([{
        result: {
          some: 'data'
        }
      }]);
    });

  });

  describe('Get folder contents', () => {

    it('should fail if missing param `id`', async () => {
      // Arrange
      const controller = getController({});
      const request = getRequest({
        behalfUser: {},
        params: {
          id: ''
        },
      });
      const response = getResponse();

      try {
        // Act
        await controller.getFolderContents(request, response);
        expect(true).to.be.false;
      } catch ({ message }) {
        // Assert
        expect(message).to.equal('Folder ID is not valid');
      }
    });

    it('should fail if first method fails', async () => {
      // Arrange
      const services = {
        Folder: {
          getById: stubOf('getById').rejects({
            message: 'my-error'
          }),
          getFolders: stubOf('getById').resolves(),
        },
        Files: {
          getByFolderAndUserId: stubOf('getByFolderAndUserId').resolves()
        }
      };
      const controller = getController(services);
      const request = getRequest({
        behalfUser: {},
        params: {
          id: '2'
        },
      });
      const jsonSpy = sinon.spy();
      const response = getResponse({
        status: () => {
          return {
            json: jsonSpy
          };
        }
      });

      // Act
      await controller.getFolderContents(request, response);

      // Assert
      expect(jsonSpy.calledOnce).to.be.true;
      expect(jsonSpy.args[0]).to.deep.equal([{
        error: 'my-error'
      }]);
    });

    it('should fail if second method fails', async () => {
      // Arrange
      const services = {
        Folder: {
          getById: stubOf('getById').resolves(),
          getFolders: stubOf('getById').rejects({
            message: 'my-error'
          }),
        },
        Files: {
          getByFolderAndUserId: stubOf('getByFolderAndUserId').resolves()
        }
      };
      const controller = getController(services);
      const request = getRequest({
        behalfUser: {},
        params: {
          id: '2'
        },
      });
      const jsonSpy = sinon.spy();
      const response = getResponse({
        status: () => {
          return {
            json: jsonSpy
          };
        }
      });

      // Act
      await controller.getFolderContents(request, response);

      // Assert
      expect(jsonSpy.calledOnce).to.be.true;
      expect(jsonSpy.args[0]).to.deep.equal([{
        error: 'my-error'
      }]);
    });

    it('should fail if third method fails', async () => {
      // Arrange
      const services = {
        Folder: {
          getById: stubOf('getById').resolves(),
          getFolders: stubOf('getById').resolves(),
        },
        Files: {
          getByFolderAndUserId: stubOf('getByFolderAndUserId').rejects({
            message: 'my-error'
          })
        }
      };
      const controller = getController(services);
      const request = getRequest({
        behalfUser: {},
        params: {
          id: '2'
        },
      });
      const jsonSpy = sinon.spy();
      const response = getResponse({
        status: () => {
          return {
            json: jsonSpy
          };
        }
      });

      // Act
      await controller.getFolderContents(request, response);

      // Assert
      expect(jsonSpy.calledOnce).to.be.true;
      expect(jsonSpy.args[0]).to.deep.equal([{
        error: 'my-error'
      }]);
    });

    it('should execute fine when no error', async () => {
      // Arrange
      const services = {
        Folder: {
          getById: stubOf('getById').resolves({
            data: 'some'
          }),
          getFolders: stubOf('getById').resolves([
            {}, {}
          ]),
        },
        Files: {
          getByFolderAndUserId: stubOf('getByFolderAndUserId').resolves([
            {}
          ])
        }
      };
      const controller = getController(services);
      const request = getRequest({
        behalfUser: {},
        params: {
          id: '2'
        },
      });
      const jsonSpy = sinon.spy();
      const response = getResponse({
        status: () => {
          return {
            json: jsonSpy
          };
        }
      });

      // Act
      await controller.getFolderContents(request, response);

      // Assert
      expect(jsonSpy.calledOnce).to.be.true;
      expect(jsonSpy.args[0]).to.deep.equal([{
        data: 'some',
        children: [{}, {}],
        files: [{}]
      }]);
    });

  });

  describe('Get folder size', () => {

    it('should fail if missing param `id`', async () => {
      // Arrange
      const controller = getController({});
      const request = getRequest({
        params: {
          id: ''
        },
      });
      const response = getResponse();

      try {
        // Act
        await controller.getFolderSize(request, response);
        expect(true).to.be.false;
      } catch ({ message }) {
        // Assert
        expect(message).to.equal('Folder ID is not valid');
      }
    });

    it('should execute fine when no error', async () => {
      // Arrange
      const services = {
        Share: {
          getFolderSize: stubOf('getFolderSize').resolves(5)
        }
      };
      const controller = getController(services);
      const request = getRequest({
        user: {
          id: ''
        },
        params: {
          id: '2'
        },
      });
      const jsonSpy = sinon.spy();
      const response = getResponse({
        status: () => {
          return {
            json: jsonSpy
          };
        }
      });

      // Act
      await controller.getFolderSize(request, response);

      // Assert
      expect(jsonSpy.calledOnce).to.be.true;
      expect(jsonSpy.args[0]).to.deep.equal([{
        size: 5
      }]);
    });

  });

});


function getController(services = {}, logger = {}): StorageController {
  const defaultServices = {
    Files: {},
    Folder: {},
    UsersReferrals: {},
    Analytics: {},
    User: {},
    Notifications: {},
    Share: {}
  };

  const finalServices = {
    ...defaultServices,
    ...services
  };

  const defaultLogger = {
    error: () => null,
    warn: () => null
  };

  const finalLogger = {
    ...defaultLogger,
    ...logger
  } as unknown as Logger;

  return new StorageController(finalServices, finalLogger);
}

function getRequest(props = {}): Request {
  return props as unknown as Request;
}

function getResponse(props = {}): Response {
  return props as unknown as Response;
}

function stubOf(functionName: string): SinonStub {
  return sinon.stub({
    [functionName]: null
  }, functionName);
}