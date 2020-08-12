import React from "react";
import * as api from "./api";
import moment from "moment";
import {
  Button,
  Table,
  Space,
  Popconfirm,
  message,
  Card,
  Tooltip,
  Modal,
  Drawer,
  Form,
  Select,
  Input,
  DatePicker,
  InputNumber,
  Switch
} from "antd";
import {
  EditOutlined,
  DeleteOutlined,
  PlusOutlined,
  PoweroffOutlined,
  CaretRightOutlined,
  PauseOutlined,
  RedoOutlined
} from "@ant-design/icons";

export default class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      scheduler: {},
      functions: [],
      jobs: [],
      formCurrentJob: undefined,
      formCurrentFunction: undefined,
      formCurrentTriggerType: undefined,
      moreFormFields: false,
      drawerVisible: false
    };
    this.formRef = React.createRef();
    this.updateJobs = this.updateJobs.bind(this);
  }

  updateJobs() {
    api.getJobs().then(resp => {
      this.setState({ jobs: resp.data.jobs });
    });
  }

  componentDidMount() {
    api.getScheduler().then(resp => {
      this.setState({ scheduler: resp.data });
    });

    api.getFunctions().then(resp => {
      this.setState({ functions: resp.data.functions });
    });

    this.updateJobs();
    this.interval = setInterval(this.updateJobs, 1000);
  }

  componentWillUnmount() {
    clearInterval(this.interval);
  }

  schedulerAction(action) {
    api.schedulerAction(action).then(resp => {
      this.setState({ scheduler: resp.data });
    });
  }

  get schedulerState() {
    return this.state.scheduler.state;
  }

  get form() {
    return this.formRef.current;
  }

  echoTriggerParams(name) {
    return (
      this.state.formCurrentJob &&
      (this.state.formCurrentJob.trigger.params[name] || undefined)
    );
  }

  render() {
    return (
      <>
        <h1>Dida 任务管理</h1>
        <Card hoverable bodyStyle={{ padding: 0 }}>
          <Table dataSource={this.state.jobs} pagination={false} rowKey="id">
            <Table.Column title="名称" dataIndex="name" />
            <Table.Column
              title="下次运行时间"
              dataIndex="next_run_time"
              render={value =>
                value && moment(value).format("YYYY-MM-DD HH:mm:ss")
              }
            />
            <Table.Column
              title="触发器"
              dataIndex={["trigger", "expression"]}
            />
            <Table.Column
              render={record => (
                <Space>
                  <Tooltip title="查看">
                    <Button
                      type="primary"
                      shape="circle"
                      size="small"
                      icon={<EditOutlined />}
                      onClick={() => {
                        api.getJob(record.id).then(resp => {
                          this.setState({
                            formCurrentJob: resp.data,
                            formCurrentFunction: resp.data.func,
                            formCurrentTriggerType: resp.data.trigger.type,
                            drawerVisible: true
                          });
                        });
                      }}
                    />
                  </Tooltip>
                  {record["next_run_time"] ? (
                    <Tooltip title="暂停">
                      <Button
                        type="primary"
                        shape="circle"
                        size="small"
                        icon={<PauseOutlined />}
                        onClick={() => api.jobAction(record.id, "pause")}
                      />
                    </Tooltip>
                  ) : (
                    <Tooltip title="继续">
                      <Button
                        type="primary"
                        shape="circle"
                        size="small"
                        icon={<RedoOutlined />}
                        onClick={() => api.jobAction(record.id, "resume")}
                      />
                    </Tooltip>
                  )}
                  <Popconfirm
                    title={`确定删除 ${record.name}？`}
                    okText="删除"
                    okButtonProps={{ danger: true, type: "primary" }}
                    cancelText="取消"
                    onConfirm={() => {
                      api.deleteJob(record.id).then(() => {
                        message.success(`已删除任务：${record.name}`);
                      });
                    }}
                  >
                    <Tooltip title="删除">
                      <Button
                        type="primary"
                        shape="circle"
                        size="small"
                        icon={<DeleteOutlined />}
                        danger
                      />
                    </Tooltip>
                  </Popconfirm>
                </Space>
              )}
            />
          </Table>
        </Card>

        <Drawer
          title={this.state.formCurrentJob ? "查看任务" : "创建任务"}
          visible={this.state.drawerVisible}
          width={400}
          destroyOnClose={true}
          onClose={() => {
            this.setState({ drawerVisible: false });
          }}
          afterVisibleChange={visible => {
            if (!visible) {
              this.setState({
                formCurrentJob: undefined,
                formCurrentFunction: undefined,
                formCurrentTriggerType: undefined,
                moreFormFields: false
              });
            }
          }}
          footer={
            <div>
              <Button type="primary" onClick={() => this.form.submit()}>
                {this.state.formCurrentJob ? "修改" : "创建"}
              </Button>
            </div>
          }
        >
          <Form
            layout="vertical"
            ref={this.formRef}
            scrollToFirstError
            onFinish={values => {
              (() => {
                if (this.state.formCurrentJob) {
                  const id = this.state.formCurrentJob.id;
                  return api.updateJob(id, values).then(() => {
                    message.success("任务修改成功");
                  });
                } else {
                  return api.addJob(values).then(() => {
                    message.success("任务创建成功");
                  });
                }
              })().then(() => {
                this.setState({ drawerVisible: false });
              });
            }}
          >
            <h3>函数</h3>
            <Form.Item
              wrapperCol={{ span: 12 }}
              label="选择一个函数"
              name={["func", "id"]}
              rules={[{ required: true, message: "" }]}
              initialValue={
                this.state.formCurrentJob && this.state.formCurrentJob.func.id
              }
            >
              <Select
                onChange={value => {
                  for (const fn of this.state.functions) {
                    if (fn.id === value) {
                      this.setState({ formCurrentFunction: fn });
                    }
                  }
                }}
                disabled={this.state.formCurrentJob}
              >
                {this.state.functions.map(item => (
                  <Select.Option key={item.id} value={item.id}>
                    {item.name}
                  </Select.Option>
                ))}
              </Select>
            </Form.Item>
            {this.state.formCurrentFunction &&
              this.state.formCurrentFunction.params.map(item => (
                <Form.Item
                  wrapperCol={{ span: 20 }}
                  name={["func", "params", item.name]}
                  label={`参数 ${item.name}`}
                  key={`${this.state.formCurrentFunction.id}:${item.name}`}
                  rules={[{ required: item.required, message: "" }]}
                  initialValue={
                    item.value === undefined ? item.default : item.value
                  }
                >
                  <Input />
                </Form.Item>
              ))}
            <h3>触发器</h3>
            <Form.Item
              wrapperCol={{ span: 12 }}
              name={["trigger", "type"]}
              label="选择一种触发器"
              rules={[{ required: true, message: "" }]}
              initialValue={this.state.formCurrentTriggerType}
            >
              <Select
                onChange={value => {
                  this.setState({ formCurrentTriggerType: value });
                }}
              >
                <Select.Option value="date">Date</Select.Option>
                <Select.Option value="interval">Interval</Select.Option>
              </Select>
            </Form.Item>
            {this.state.formCurrentTriggerType === "date" && (
              <Form.Item
                name={["trigger", "params", "run_date"]}
                label="运行时间"
                rules={[{ required: true, message: "" }]}
              >
                <DatePicker showTime />
              </Form.Item>
            )}
            {this.state.formCurrentTriggerType === "interval" && (
              <Form.Item label="间隔时间">
                <div className="interval-field">
                  <Form.Item
                    noStyle
                    name={["trigger", "params", "weeks"]}
                    normalize={value => value || undefined}
                    initialValue={this.echoTriggerParams("weeks")}
                  >
                    <InputNumber min={0} placeholder="周" />
                  </Form.Item>
                  <Form.Item
                    noStyle
                    name={["trigger", "params", "days"]}
                    normalize={value => value || undefined}
                    initialValue={this.echoTriggerParams("days")}
                  >
                    <InputNumber min={0} placeholder="天" />
                  </Form.Item>
                  <Form.Item
                    noStyle
                    name={["trigger", "params", "hours"]}
                    normalize={value => value || undefined}
                    initialValue={this.echoTriggerParams("hours")}
                  >
                    <InputNumber min={0} placeholder="时" />
                  </Form.Item>
                  <Form.Item
                    noStyle
                    name={["trigger", "params", "minutes"]}
                    normalize={value => value || undefined}
                    initialValue={this.echoTriggerParams("minutes")}
                  >
                    <InputNumber min={0} placeholder="分" />
                  </Form.Item>
                  <Form.Item
                    noStyle
                    name={["trigger", "params", "seconds"]}
                    normalize={value => value || undefined}
                    initialValue={this.echoTriggerParams("seconds")}
                  >
                    <InputNumber min={0} placeholder="秒" />
                  </Form.Item>
                </div>
              </Form.Item>
            )}
            {this.state.moreFormFields ? (
              <>
                <h3>高级选项</h3>
                <Form.Item
                  wrapperCol={{ span: 13 }}
                  label="任务名称"
                  name={"name"}
                  initialValue={
                    this.state.formCurrentJob && this.state.formCurrentJob.name
                  }
                  normalize={value => value || undefined}
                >
                  <Input />
                </Form.Item>
                {/*
                <Form.Item
                  label="下次运行时间"
                  name="next_run_time"
                  initialValue={(() => {
                    if (this.state.formCurrentJob) {
                      const nextRunTime = this.state.formCurrentJob[
                        "next_run_time"
                      ];
                      if (nextRunTime) {
                        return moment(nextRunTime);
                      }
                    }
                  })()}
                >
                  <DatePicker showTime allowClear={false} />
                </Form.Item>
                */}
                <Form.Item
                  label="实例上限"
                  name="max_instances"
                  initialValue={
                    this.state.formCurrentJob
                      ? this.state.formCurrentJob["max_instances"]
                      : 1
                  }
                >
                  <InputNumber min={1} />
                </Form.Item>
                <Form.Item
                  label="允许延迟"
                  name="misfire_grace_time"
                  initialValue={
                    this.state.formCurrentJob
                      ? this.state.formCurrentJob["misfire_grace_time"]
                      : 1
                  }
                >
                  <InputNumber min={1} />
                </Form.Item>
                <Form.Item
                  label="合并执行"
                  name="coalesce"
                  valuePropName="checked"
                  initialValue={
                    this.state.formCurrentJob
                      ? this.state.formCurrentJob["coalesce"]
                      : true
                  }
                >
                  <Switch />
                </Form.Item>
              </>
            ) : (
              <a onClick={() => this.setState({ moreFormFields: true })}>
                高级选项
              </a>
            )}
          </Form>
        </Drawer>

        <div className="fixed-widget">
          <Space direction="vertical">
            <Tooltip title="创建任务" placement="left">
              <Button
                type="primary"
                shape="circle"
                size="large"
                icon={<PlusOutlined />}
                onClick={() => this.setState({ drawerVisible: true })}
              />
            </Tooltip>
            {this.schedulerState === 1 && (
              <Tooltip title="暂停" placement="left">
                <Button
                  type="primary"
                  shape="circle"
                  size="large"
                  icon={<PauseOutlined />}
                  onClick={() => this.schedulerAction("pause")}
                />
              </Tooltip>
            )}
            {this.schedulerState === 2 && (
              <Tooltip title="继续" placement="left">
                <Button
                  type="primary"
                  shape="circle"
                  size="large"
                  icon={<RedoOutlined />}
                  onClick={() => this.schedulerAction("resume")}
                />
              </Tooltip>
            )}
            {this.schedulerState === 0 ? (
              <Tooltip title="开机" placement="left">
                <Button
                  type="primary"
                  shape="circle"
                  size="large"
                  icon={<CaretRightOutlined />}
                  onClick={() => this.schedulerAction("start")}
                />
              </Tooltip>
            ) : (
              <Tooltip title="关机" placement="left">
                <Button
                  type="primary"
                  shape="circle"
                  size="large"
                  icon={<PoweroffOutlined />}
                  danger
                  onClick={() =>
                    Modal.confirm({
                      title: "确定关机？",
                      content: "关机后，所有任务将被移除！",
                      okText: "关机",
                      okButtonProps: { danger: true, type: "primary" },
                      cancelText: "取消",
                      onOk: () => {
                        this.schedulerAction("shutdown");
                      }
                    })
                  }
                />
              </Tooltip>
            )}
          </Space>
        </div>
      </>
    );
  }
}
